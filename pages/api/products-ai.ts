import axios from 'axios';
import OpenAI from 'openai';

import functions from '../utils/functions';
import { logger } from '../utils/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const debug = logger('ProductsAction');

export default async function ProductsAction(req, res) {
  let start = new Date().getTime();

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
    model: req.body.config.model,
    temperature: 0.6,
  });

  let categories = JSON.parse(
    response.choices[0].message.function_call.arguments
  ).categories;
  debug(JSON.stringify(categories));

  let productCategories = [];

  for (let i = 0; categories.length > i; i++) {
    productCategories.push(categories[i].category);
  }

  let categoryDataStr = {
    'Category Names': productCategories,
    'Category Vocab': req.body.vocabularyName,
  };


  debug(categoryDataStr);

  // check if vocabulary exists

  let vocabId = await getExistingVocabID(req.body.vocabularyName, globalSiteId);

  /* Setup Vocabulary */

  let options = await functions.getAPIOptions('POST', 'en-US');
  let apiPath = '';

  if(vocabId>0){
    debug("Using existing vocabId: "+vocabId);
  } else {
    apiPath =
      process.env.LIFERAY_PATH +
      '/o/headless-admin-taxonomy/v1.0/sites/' +
      globalSiteId +
      '/taxonomy-vocabularies';
    let vocabPostObj = { name: req.body.vocabularyName };

    let options = functions.getAPIOptions('POST', 'en-US');

    // wait for the vocab to complete before adding categories
    try {
      const vocabResponse = await axios.post(apiPath, vocabPostObj, options);

      debug(vocabResponse.data);
      vocabId = vocabResponse.data.id;
    } catch (error) {
      debug(error.response.data.status+":"+error.response.data.title);
    }
  }

  const categMap = new Map();

  debug('returned vocab key is ' + vocabId);
  let currCategory, currCategoryJson, categResponse;

  for (var i = 0; i < productCategories.length; i++) {

    currCategory = productCategories[i];

    // check if category exists

    let categoryId = await getExistingCategoryID(currCategory, vocabId);

    // create the categories for the vocabulary that was just generated

    if(categoryId>0){
      debug("Using existing categoryId: "+categoryId);
      categMap.set(currCategory, categoryId);
    } else {

      currCategoryJson = { name: currCategory, taxonomyVocabularyId: vocabId };

      apiPath =
        process.env.LIFERAY_PATH +
        '/o/headless-admin-taxonomy/v1.0/taxonomy-vocabularies/' +
        vocabId +
        '/taxonomy-categories';
      debug('creating category');
      debug(currCategoryJson);

      try {
        categResponse = await axios.post(apiPath, currCategoryJson, options);

        debug(categResponse.data.id + ' is the id for ' + currCategory);

        categMap.set(currCategory, categResponse.data.id);
      } catch (error) {
        debug(error);
        debug(error.response.data.status+":"+error.response.data.title);
      }
    }

    debug(categMap);
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
    debug('category -- ' + currCategory + ':' + currCategoryId);

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

        debug('sending: ' + productName);
        debug(apiPath);
        debug(productJson);

        productResponse = await axios.post(apiPath, productJson, options);

        productId = productResponse.data.productId;
        debug(productName + ' created with id ' + productId);
        productCategoryJson = {
          id: currCategoryId,
          name: currCategory,
          siteId: process.env.LIFERAY_GLOBAL_SITE_ID,
        };

        debug('includeImages:' + imageGeneration);
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

          debug(imageResponse.data[0].url);

          let imgschema = JSON.stringify({
            externalReferenceCode: 'product-' + productResponse.data.productId,
            neverExpire: true,
            priority: 1,
            src: imageResponse.data[0].url,
            title: { en_US: productName },
          });

          debug(imgschema);

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

        }
      } catch (productError) {
        debug(
          'error creating product ' + productName + ' -- ' + productError
        );
      }
    }
  }

  let end = new Date().getTime();

  res.status(200).json({ result: `Completed in ${functions.millisToMinutesAndSeconds(end - start)}` });
}

async function getExistingVocabID(name, globalSiteId) {
  
  name = name.replaceAll("'","''");
  let filter = "name eq '"+name+"'";

  let apiPath =
    process.env.LIFERAY_PATH +
    '/o/headless-admin-taxonomy/v1.0/sites/' +
    globalSiteId +
    '/taxonomy-vocabularies?filter='+encodeURI(filter);

  let options = functions.getAPIOptions('GET', 'en-US');

  try {
    const vocabResponse = await axios.get(apiPath, options);

    if(vocabResponse.data.items.length>0){
      return vocabResponse.data.items[0].id;
    } else {
      return -1;
    }
    
  } catch (error) {
    debug(error);
  }
}

async function getExistingCategoryID(name, vocabId) {
  
  name = name.replaceAll("'","''");
  let filter = "name eq '"+name+"'";

  let apiPath =
    process.env.LIFERAY_PATH +
    '/o/headless-admin-taxonomy/v1.0/taxonomy-vocabularies/' +
    vocabId +
    '/taxonomy-categories?filter='+encodeURI(filter);

  let options = functions.getAPIOptions('GET', 'en-US');

  try {
    const categoryResponse = await axios.get(apiPath, options);

    if(categoryResponse.data.items.length>0){
      return categoryResponse.data.items[0].id;
    } else {
      return -1;
    }
    
  } catch (error) {
    debug(error);
  }
}