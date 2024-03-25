import axios, { AxiosInstance } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

import schema, { z } from "../../schemas/zod";
import { axiosInstance } from "../../services/liferay";
import functions from "../../utils/functions";
import { logger } from "../../utils/logger";

const debug = logger("ProductsAction");

export default async function ProductsAction(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  let start = new Date().getTime();

  const openai = new OpenAI({
    apiKey: req.body.config.openAIKey,
  });

  const { catalogId, globalSiteId, imageGeneration, vocabularyName } =
    req.body as z.infer<typeof schema.productsAI>;

  /* Get OpenAI Content based on Theme */

  const categorySchema = {
    properties: {
      categories: {
        description:
          "An array of " + req.body.numberOfCategories + " product categories",
        items: {
          properties: {
            category: {
              description: "Name of the product category",
              type: "string",
            },
            products: {
              description:
                "An array of " +
                req.body.numberOfProducts +
                " products within the suggested category",
              items: {
                properties: {
                  price: {
                    description: "Cost of this product in USD",
                    type: "string",
                  },
                  productName: {
                    description:
                      "The name of a product that exists in the given category",
                    type: "string",
                  },
                  shortDescription: {
                    description: "A short description of this product",
                    type: "string",
                  },
                  stock: {
                    description:
                      "Number of product items that are currently in stock.",
                    type: "integer",
                  },
                },
                type: "object",
              },
              required: ["product", "shortDescription", "price", "stock"],
              type: "array",
            },
          },
          type: "object",
        },
        required: ["categories"],
        type: "array",
      },
    },
    type: "object",
  };

  const response = await openai.chat.completions.create({
    functions: [
      { name: "get_commerce_categories", parameters: categorySchema },
    ],
    messages: [
      {
        content:
          "You are a commerce administrator responsible for defining product categories for your company.",
        role: "system",
      },
      {
        content:
          "Create a list of products and categories on the subject of: " +
          req.body.companyTheme,
        role: "user",
      },
    ],
    model: req.body.config.model,
    temperature: 0.6,
  });

  let categories = JSON.parse(
    response.choices[0].message.function_call.arguments,
  ).categories;

  debug(JSON.stringify(categories));

  let productCategories = [];

  for (let i = 0; categories.length > i; i++) {
    productCategories.push(categories[i].category);
  }

  const categoryDataStr = {
    "Category Names": productCategories,
    "Category Vocab": vocabularyName,
  };

  debug(categoryDataStr);

  const axios = axiosInstance(req, res);

  let vocabularyId = await getExistingVocabID(
    axios,
    vocabularyName,
    globalSiteId,
  );

  /* Setup Vocabulary */

  if (vocabularyId > 0) {
    debug("Using existing vocabularyId: " + vocabularyId);
  } else {
    // wait for the vocab to complete before adding categories
    try {
      const vocabularyResponse = await axios.post(
        `/o/headless-admin-taxonomy/v1.0/sites/${globalSiteId}/taxonomy-vocabularies`,
        {
          name: vocabularyName,
          viewableBy: "Anyone",
        },
      );

      debug(vocabularyResponse.data);

      vocabularyId = vocabularyResponse.data.id;
    } catch (error) {
      debug(error.response.data.status + ":" + error.response.data.title);
    }
  }

  const categMap = new Map();

  debug("returned vocab key is " + vocabularyId);

  for (var i = 0; i < productCategories.length; i++) {
    const currCategory = productCategories[i];

    // check if category exists

    let categoryId = await getExistingCategoryID(
      axios,
      currCategory,
      vocabularyId,
    );

    // create the categories for the vocabulary that was just generated

    if (categoryId > 0) {
      debug("Using existing categoryId: " + categoryId);
      categMap.set(currCategory, categoryId);
    } else {
      debug("creating category");

      try {
        const categResponse = await axios.post(
          `/o/headless-admin-taxonomy/v1.0/taxonomy-vocabularies/${vocabularyId}/taxonomy-categories`,
          {
            name: currCategory,
            taxonomyVocabularyId: vocabularyId,
            viewableBy: "Anyone",
          },
        );

        debug(categResponse.data.id + " is the id for " + currCategory);

        categMap.set(currCategory, categResponse.data.id);
      } catch (error) {
        debug(error);
        debug(error.response.data.status + ":" + error.response.data.title);
      }
    }

    debug(categMap);
  }

  for (i = 0; categories.length > i; i++) {
    const currCategory = categories[i].category;
    const currCategoryId = categMap.get(currCategory);
    debug("category -- " + currCategory + ":" + currCategoryId);

    for (const {
      price: productPrice,
      productName,
      shortDescription,
      stock: inventoryCount,
    } of categories[i].products) {
      const productSku = productName.toLowerCase().replaceAll(" ", "-");

      const product = {
        active: true,
        catalogId: catalogId,
        categories: [
          {
            id: categMap.get(currCategory),
          },
        ],
        description: {
          en_US: productName,
        },
        name: {
          en_US: productName,
        },
        productStatus: 0,
        productType: "simple",
        shortDescription: {
          en_US: shortDescription,
        },
        skuFormatted: productSku,
        skus: [
          {
            neverExpire: true,
            price: parseFloat(productPrice.replaceAll("$", "")),
            published: true,
            purchasable: true,
            sku: productSku,
          },
        ],
      };

      try {
        const productResponse = await axios.post(
          "/o/headless-commerce-admin-catalog/v1.0/products",
          product,
        );

        const productId = productResponse.data.productId;

        debug(productName + " created with id " + productId);

        debug("includeImages:" + imageGeneration);

        if (imageGeneration !== "none") {
          let imagePrompt = `Create a "${req.body.companyTheme}" commerce product image for "${productName}", ${shortDescription}`;

          debug("Using image prompt: " + imagePrompt);

          if (req.body.imageStyle) {
            imagePrompt = `Create an image in the style of ${req.body.imageStyle}. ${imagePrompt}`;
          }

          const imageResponse = await openai.images.generate({
            model: imageGeneration,
            n: 1,
            prompt: imagePrompt,
            size: "1024x1024",
          });

          debug(imageResponse.data[0].url);

          await axios.post(
            "/o/headless-commerce-admin-catalog/v1.0/products/" +
              productResponse.data.productId +
              "/images/by-url",
            {
              externalReferenceCode:
                "product-" + productResponse.data.productId,
              neverExpire: true,
              priority: 1,
              src: imageResponse.data[0].url,
              title: { en_US: productName },
            },
          );
        }
      } catch (productError) {
        debug("error creating product " + productName + " -- " + productError);
      }
    }
  }

  let end = new Date().getTime();

  res.status(200).json({
    result: `Completed in ${functions.millisToMinutesAndSeconds(end - start)}`,
  });
}

async function getExistingVocabID(
  axios: AxiosInstance,
  name: string,
  globalSiteId: number | string,
) {
  name = name.replaceAll("'", "''");

  let filter = "name eq '" + name + "'";

  try {
    const vocabResponse = await axios.get(
      `/o/headless-admin-taxonomy/v1.0/sites/${globalSiteId}/taxonomy-vocabularies?filter=${encodeURI(filter)}`,
    );

    if (vocabResponse.data.items.length > 0) {
      return vocabResponse.data.items[0].id;
    } else {
      return -1;
    }
  } catch (error) {
    debug(error);
  }
}

async function getExistingCategoryID(
  axios: AxiosInstance,
  name: string,
  vocabId: any,
) {
  name = name.replaceAll("'", "''");
  let filter = "name eq '" + name + "'";

  try {
    const categoryResponse = await axios.get(
      "/o/headless-admin-taxonomy/v1.0/taxonomy-vocabularies/" +
        vocabId +
        "/taxonomy-categories?filter=" +
        encodeURI(filter),
    );

    if (categoryResponse.data.items.length > 0) {
      return categoryResponse.data.items[0].id;
    } else {
      return -1;
    }
  } catch (error) {
    debug(error);
  }
}
