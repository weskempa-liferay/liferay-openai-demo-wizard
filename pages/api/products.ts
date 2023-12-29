import axios from 'axios';
import OpenAI from 'openai';

import functions from '../utils/functions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function Action(req, res) {
  let start = new Date().getTime();

  const debug = req.body.debugMode;
  const imageGeneration = req.body.imageGeneration;
  let catalogId = req.body.catalogId;
  let globalSiteId = req.body.gloablSiteId;

  /* Get OpenAI Content based on Theme */

  const categorySchema = {
    properties: {
      categories: {
        description:
          'An array of ' + req.body.numberOfCategories + ' product categories',
        items: {
          properties: {
            category: {
              description: 'Name of the product category',
              type: 'string',
            },
            products: {
              description:
                'An array of ' +
                req.body.numberOfProducts +
                ' products within the suggested category',
              items: {
                properties: {
                  price: {
                    description: 'Cost of this product in USD',
                    type: 'string',
                  },
                  productName: {
                    description:
                      'The name of a product that exists in the given category',
                    type: 'string',
                  },
                  shortDescription: {
                    description: 'A short description of this product',
                    type: 'string',
                  },
                  stock: {
                    description:
                      'Number of product items that are currently in stock.',
                    type: 'integer',
                  },
                },
                type: 'object',
              },
              required: ['product', 'shortDescription', 'price', 'stock'],
              type: 'array',
            },
          },
          type: 'object',
        },
        required: ['categories'],
        type: 'array',
      },
    },
    type: 'object',
  };

  const response = await openai.chat.completions.create({
    functions: [
      { name: 'get_commerce_categories', parameters: categorySchema },
    ],
    messages: [
      {
        content:
          'You are a commerce administrator responsible for defining product categories for your company.',
        role: 'system',
      },
      {
        content:
          'Create a list of products and categories on the subject of: ' +
          req.body.companyTheme,
        role: 'user',
      },
    ],
    model: 'gpt-3.5-turbo',
    temperature: 0.6,
  });

  let categories = JSON.parse(
    response.choices[0].message.function_call.arguments
  ).categories;
  if (debug) console.log(JSON.stringify(categories));

  let productCategories = [];

  for (let i = 0; categories.length > i; i++) {
    productCategories.push(categories[i].category);
  }

  let categoryDataStr = {
    'Category Names': productCategories,
    'Category Vocab': req.body.categoryName + ' Type',
  };

  if (debug) console.log(categoryDataStr);

  /* Setup Vocabulary */

  let apiPath =
    process.env.LIFERAY_PATH +
    '/o/headless-admin-taxonomy/v1.0/sites/' +
    globalSiteId +
    '/taxonomy-vocabularies';
  let vocabPostObj = { name: req.body.categoryName + ' Categories' };

  let options = functions.getAPIOptions('POST', 'en-US');

  let apiRes = '';

  // wait for the vocab to complete before adding categories
  try {
    const vocabResponse = await axios.post(apiPath, vocabPostObj, options);

    if (debug) console.log(vocabResponse.data);
    apiRes = vocabResponse.data.id;
  } catch (error) {
    console.log(error);
    apiRes = error;
  }

  const categMap = new Map();

  if (debug) console.log('returned vocab key is ' + apiRes);
  // create the categories for the vocabulary that was just generated
  let currCategory, currCategoryJson, categResponse;
  for (var i = 0; i < productCategories.length; i++) {
    currCategory = productCategories[i];

    currCategoryJson = { name: currCategory, taxonomyVocabularyId: apiRes };

    apiPath =
      process.env.LIFERAY_PATH +
      '/o/headless-admin-taxonomy/v1.0/taxonomy-vocabularies/' +
      apiRes +
      '/taxonomy-categories';
    if (debug) console.log('creating category');
    if (debug) console.log(currCategoryJson);

    try {
      categResponse = await axios.post(apiPath, currCategoryJson, options);

      if (debug)
        console.log(categResponse.data.id + ' is the id for ' + currCategory);

      categMap.set(currCategory, categResponse.data.id);
    } catch (categError) {
      console.log(categError);
    }

    if (debug) console.log(categMap);
  }

  // add the products
  let j;
  let productDataList;
  let productName,
    shortDescription,
    productPrice,
    inventoryCount,
    productSku,
    productJson;
  let productResponse, productId, productCategoryJson;

  let currCategoryId;
  for (i = 0; categories.length > i; i++) {
    currCategory = categories[i].category;
    currCategoryId = categMap.get(currCategory);
    if (debug)
      console.log('category -- ' + currCategory + ':' + currCategoryId);

    productDataList = categories[i].products;

    for (j = 0; j < productDataList.length; j++) {
      productName = productDataList[j].productName;
      shortDescription = productDataList[j].shortDescription;
      productPrice = productDataList[j].price;
      inventoryCount = productDataList[j].stock;
      productSku = productName.toLowerCase().replaceAll(' ', '-');

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
        productType: 'simple',
        shortDescription: {
          en_US: shortDescription,
        },
        skuFormatted: productSku,
        skus: [
          {
            neverExpire: true,
            price: parseFloat(productPrice.replaceAll('$', '')),
            published: true,
            purchasable: true,
            sku: productSku,
          },
        ],
      };

      try {
        apiPath =
          process.env.LIFERAY_PATH +
          '/o/headless-commerce-admin-catalog/v1.0/products';

        if (debug) console.log('sending: ' + productName);
        if (debug) console.log(apiPath);
        if (debug) console.log(productJson);
        if (debug) console.log(options);

        productResponse = await axios.post(apiPath, productJson, options);

        productId = productResponse.data.productId;
        if (debug) console.log(productName + ' created with id ' + productId);
        productCategoryJson = {
          id: currCategoryId,
          name: currCategory,
          siteId: process.env.LIFERAY_GLOBAL_SITE_ID,
        };

        if (debug) console.log('includeImages:' + imageGeneration);
        if (imageGeneration != 'none') {
          let imagePrompt =
            'Create a commerce catalog image for a ' + productName;
          if (req.body.imageStyle) {
            imagePrompt =
              'Create an image in the style of ' +
              req.body.imageStyle +
              '. ' +
              imagePrompt;
          }

          const imageResponse = await openai.images.generate({
            model: imageGeneration,
            n: 1,
            prompt: imagePrompt,
            size: '1024x1024',
          });

          if (debug) console.log(imageResponse.data[0].url);

          let imgschema = JSON.stringify({
            externalReferenceCode: 'product-' + productResponse.data.productId,
            neverExpire: true,
            priority: 1,
            src: imageResponse.data[0].url,
            title: { en_US: productName },
          });

          if (debug) console.log(imgschema);

          let imgApiPath =
            process.env.LIFERAY_PATH +
            '/o/headless-commerce-admin-catalog/v1.0/products/' +
            productResponse.data.productId +
            '/images/by-url';

          let productImageResponse = await axios.post(
            imgApiPath,
            imgschema,
            options
          );

          if (debug) console.log(productImageResponse.data[0]);
        }
      } catch (productError) {
        console.log(
          'error creating product ' + productName + ' -- ' + productError
        );
      }
    }
  }

  let end = new Date().getTime();

  if (debug)
    console.log(
      'Completed in ' + functions.millisToMinutesAndSeconds(end - start)
    );

  res.status(200).json({ result: JSON.stringify(categories) });
}
