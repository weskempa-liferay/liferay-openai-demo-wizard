import axios from 'axios';

import functions from '../../utils/functions';
import { logger } from '../../utils/logger';

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

  let productCategories = [];

  for (const [key, value] of Object.entries(categoryMap)) {
    productCategories.push(key);
  }

  let categoryDataStr = {
    'Category Names': productCategories,
    'Category Vocab': req.body.vocabularyName,
  };

  debug(categoryDataStr);

  // check if vocabulary exists

  let vocabId = await getExistingVocabID(req.body.vocabularyName, globalSiteId);

  // Setup Vocabulary

  let options = await functions.getAPIOptions('POST', 'en-US');
  let apiPath = '';

  if (vocabId > 0) {
    debug('Using existing vocabId: ' + vocabId);
  } else {
    let apiPath =
      process.env.LIFERAY_PATH +
      '/o/headless-admin-taxonomy/v1.0/sites/' +
      globalSiteId +
      '/taxonomy-vocabularies';
    let vocabPostObj = { name: req.body.vocabularyName };

    // wait for the vocab to complete before adding categories
    try {
      const vocabResponse = await axios.post(apiPath, vocabPostObj, options);

      debug(vocabResponse.data);
      vocabId = vocabResponse.data.id;
    } catch (error) {
      debug(error.response.data.status + ':' + error.response.data.title);
      errorCount++;
    }
  }

  const categMap = new Map();

  debug('Returned vocab id is ' + vocabId);

  let currCategory, currCategoryJson, categResponse;

  for (var i = 0; i < productCategories.length; i++) {
    currCategory = productCategories[i];

    // check if category exists

    let categoryId = await getExistingCategoryID(currCategory, vocabId);

    // create the categories for the vocabulary that was just generated

    if (categoryId > 0) {
      debug('Using existing categoryId: ' + categoryId);
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
        debug(error.response.data.status + ':' + error.response.data.title);
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
      productslist[i].sku == '' ||
      productslist[i].sku == '?'
    ) {
      productSku = productName.toLowerCase().replaceAll(' ', '-');
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

      productResponse = await axios.post(apiPath, productJson, options);

      productId = productResponse.data.productId;

      debug('----------------------------------');
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

      debug('imgschema');
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
      debug('error creating product ' + productName + ' -- ' + productError);
      errorCount++;
    }
  }

  let end = new Date().getTime();

  res.status(200).json({
    result:
      successCount +
      ' products added, ' +
      errorCount +
      ' errors in ' +
      functions.millisToMinutesAndSeconds(end - start),
  });
}

async function getExistingVocabID(name, globalSiteId) {
  name = name.replaceAll("'", "''");
  let filter = "name eq '" + name + "'";

  let apiPath =
    process.env.LIFERAY_PATH +
    '/o/headless-admin-taxonomy/v1.0/sites/' +
    globalSiteId +
    '/taxonomy-vocabularies?filter=' +
    encodeURI(filter);

  let options = functions.getAPIOptions('GET', 'en-US');

  try {
    const vocabResponse = await axios.get(apiPath, options);

    if (vocabResponse.data.items.length > 0) {
      return vocabResponse.data.items[0].id;
    } else {
      return -1;
    }
  } catch (error) {
    debug(error);
  }
}

async function getExistingCategoryID(name, vocabId) {
  name = name.replaceAll("'", "''");
  let filter = "name eq '" + name + "'";

  let apiPath =
    process.env.LIFERAY_PATH +
    '/o/headless-admin-taxonomy/v1.0/taxonomy-vocabularies/' +
    vocabId +
    '/taxonomy-categories?filter=' +
    encodeURI(filter);

  let options = functions.getAPIOptions('GET', 'en-US');

  try {
    const categoryResponse = await axios.get(apiPath, options);

    if (categoryResponse.data.items.length > 0) {
      return categoryResponse.data.items[0].id;
    } else {
      return -1;
    }
  } catch (error) {
    debug(error);
  }
}
