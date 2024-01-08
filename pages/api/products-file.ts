import axios from 'axios';
import fs from 'fs';
import request from 'request';

import functions from '../utils/functions';
import { logger } from '../utils/logger';

const debug = logger('Products File - Action');

export default async function UsersFileAction(req, res) {
  let start = new Date().getTime();
  let successCount = 0;
  let errorCount = 0;

  let catalogId = req.body.catalogId;
  let globalSiteId = req.body.gloablSiteId;

  let productslist = req.body.csvoutput;

  debug(productslist);

  let categoryMap = {};

  for (let i = 0; productslist.length > i; i++) {
    categoryMap[productslist[i].category] = true;
  }

  debug(categoryMap);

  let productCategories = [];

  for (const [key, value] of Object.entries(categoryMap)) {
    productCategories.push(key);
  }

  let categoryDataStr = {
    'Category Names': productCategories,
    'Category Vocab': req.body.categoryName,
  };

  debug(categoryDataStr);

  
  // Setup Vocabulary 

  let apiPath =
    process.env.LIFERAY_PATH +
    '/o/headless-admin-taxonomy/v1.0/sites/' +
    globalSiteId +
    '/taxonomy-vocabularies';
  let vocabPostObj = { name: req.body.categoryName };

  let options = functions.getAPIOptions('POST', 'en-US');

  let apiRes = '';

  // wait for the vocab to complete before adding categories
  try {
    const vocabResponse = await axios.post(apiPath, vocabPostObj, options);

    debug(vocabResponse.data);
    apiRes = vocabResponse.data.id;
  } catch (error) {
    console.log(error);
    apiRes = error;
  }

  const categMap = new Map();

  debug('returned vocab key is ' + apiRes);
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
    debug('creating category');
    debug(currCategoryJson);

    try {
      categResponse = await axios.post(apiPath, currCategoryJson, options);

      if (debug)
        console.log(categResponse.data.id + ' is the id for ' + currCategory);

      categMap.set(currCategory, categResponse.data.id);
    } catch (categError) {
      console.log(categError);
    }

    debug(categMap);
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

      /*
      debug('sending: ' + productName);
      debug(apiPath);
      debug(productJson);
      debug(options);
      */

      productResponse = await axios.post(apiPath, productJson, options);

      productId = productResponse.data.productId;
      
      debug("----------------------------------");
      debug(productName + ' created with id ' + productId);

      productCategoryJson = {
        id: currCategoryId,
        name: currCategory,
        siteId: process.env.LIFERAY_GLOBAL_SITE_ID,
      };

      let imgschema = JSON.stringify({
        externalReferenceCode: 'product-' + productResponse.data.productId,
        neverExpire: true,
        priority: 1,
        src: imageUrl,
        title: { en_US: productName },
      });

      debug("imgschema");
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

    } catch (productError) {
      console.log(
        'error creating product ' + productName + ' -- ' + productError
      );
    }
  }

  let end = new Date().getTime();

  res.status(200).json({
    result:
      successCount +
      ' users added, ' +
      errorCount +
      ' errors in ' +
      functions.millisToMinutesAndSeconds(end - start),
  });
}
