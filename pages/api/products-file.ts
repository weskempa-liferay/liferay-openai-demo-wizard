import { AxiosInstance } from "axios";
import { NextApiRequest, NextApiResponse } from "next";

import { axiosInstance } from "../../services/liferay";
import functions from "../../utils/functions";
import { logger } from "../../utils/logger";

const debug = logger("Products File - Action");

export default async function UsersFileAction(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const start = new Date().getTime();
  let successCount = 0;
  let errorCount = 0;

  const { catalogId, csvoutput: productslist, globalSiteId } = req.body;

  const axios = axiosInstance(req, res);

  debug(productslist);

  let categoryMap = {};

  for (let i = 0; productslist.length > i; i++) {
    categoryMap[productslist[i].category] = true;
  }

  let productCategories = [];

  for (const [key] of Object.entries(categoryMap)) {
    productCategories.push(key);
  }

  const categoryDataStr = {
    "Category Names": productCategories,
    "Category Vocab": req.body.vocabularyName,
  };

  debug(categoryDataStr);

  // check if vocabulary exists

  let vocabId = await getExistingVocabID(
    axios,
    req.body.vocabularyName,
    globalSiteId,
  );

  // Setup Vocabulary

  if (vocabId > 0) {
    debug("Using existing vocabId: " + vocabId);
  } else {
    try {
      const vocabResponse = await axios.post(
        `/o/headless-admin-taxonomy/v1.0/sites/${globalSiteId}/taxonomy-vocabularies`,
        { name: req.body.vocabularyName },
      );

      debug(vocabResponse.data);
      vocabId = vocabResponse.data.id;
    } catch (error) {
      debug(error.response.data.status + ":" + error.response.data.title);
      errorCount++;
    }
  }

  const categMap = new Map();

  debug("Returned vocab id is " + vocabId);

  let currCategory, currCategoryJson, categResponse;

  for (var i = 0; i < productCategories.length; i++) {
    currCategory = productCategories[i];

    // check if category exists

    let categoryId = await getExistingCategoryID(axios, currCategory, vocabId);

    // create the categories for the vocabulary that was just generated

    if (categoryId > 0) {
      debug("Using existing categoryId: " + categoryId);
      categMap.set(currCategory, categoryId);
    } else {
      debug("creating category", currCategoryJson);

      try {
        categResponse = await axios.post(
          `/o/headless-admin-taxonomy/v1.0/taxonomy-vocabularies/${vocabId}/taxonomy-categories`,
          { name: currCategory, taxonomyVocabularyId: vocabId },
        );

        debug(categResponse.data.id + " is the id for " + currCategory);

        categMap.set(currCategory, categResponse.data.id);
      } catch (error) {
        debug(error.response.data.status + ":" + error.response.data.title);
        errorCount++;
      }

      debug(categMap);
    }
  }

  // add the products
  let shortDescription,
    productName,
    productPrice,
    imageUrl,
    inventoryCount,
    productSku,
    productJson;
  let productResponse, productId, productCategoryJson;

  let currCategoryId;

  for (i = 0; productslist.length > i; i++) {
    currCategory = productslist[i].category;
    currCategoryId = categMap.get(currCategory);

    productName = productslist[i].productName;
    imageUrl = productslist[i].imageUrl;
    shortDescription = productslist[i].shortDescription;
    productPrice = productslist[i].price;
    inventoryCount = productslist[i].stock;
    if (
      !productslist[i].sku ||
      productslist[i].sku == "" ||
      productslist[i].sku == "?"
    ) {
      productSku = productName.toLowerCase().replaceAll(" ", "-");
    } else {
      productSku = productslist[i].sku;
    }

    productJson = {
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
      productResponse = await axios.post(
        "/o/headless-commerce-admin-catalog/v1.0/products",
        productJson,
      );

      productId = productResponse.data.productId;

      debug("----------------------------------");
      debug(productName + " created with id " + productId);

      productCategoryJson = {
        id: currCategoryId,
        name: currCategory,
        siteId: globalSiteId,
      };

      let imgschema = JSON.stringify({
        externalReferenceCode: "product-" + productResponse.data.productId,
        neverExpire: true,
        priority: 1,
        src: imageUrl,
        title: { en_US: productName },
      });

      debug({ imgschema });

      await axios.post(
        "/o/headless-commerce-admin-catalog/v1.0/products/" +
          productResponse.data.productId +
          "/images/by-url",
        imgschema,
      );
    } catch (productError) {
      debug("error creating product " + productName + " -- " + productError);
      errorCount++;
    }
  }

  let end = new Date().getTime();

  res.status(200).json({
    result: `${successCount} products added, ${errorCount} errors in ${functions.millisToMinutesAndSeconds(end - start)} `,
  });
}

async function getExistingVocabID(
  axios: AxiosInstance,
  name: string,
  globalSiteId: string,
) {
  name = name.replaceAll("'", "''");
  let filter = "name eq '" + name + "'";

  try {
    const vocabResponse = await axios.get(
      "/o/headless-admin-taxonomy/v1.0/sites/" +
        globalSiteId +
        "/taxonomy-vocabularies?filter=" +
        encodeURI(filter),
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
  vocabId: string,
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
