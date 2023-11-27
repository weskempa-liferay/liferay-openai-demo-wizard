import OpenAI  from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const debug = false;

export default async function (req, res) {

  /* Get OpenAI Content based on Theme */

  const categorySchema = {
    type: "object",
    properties: {
      categories: {
        type: "array",
        description: "An array of 5 product categories",
        items:{
          type:"object",
          properties:{
            category:{
              type: "string",
              description: "Name of the product category"
            },
            products: {
              type:"array",
              description: "An array of 3 products within the suggested category",
              items:{
                type:"object",
                properties:{
                  productName: {
                    type: "string",
                    description: "The name of a product that exists in the given category"
                  },
                  shortDescription: {
                    type: "string",
                    description: "A short description of this product"
                  },
                  price: {
                    type: "string",
                    description: "Cost of this product in USD",
                  },
                  stock: {
                    type: "integer",
                    description: "Number of product items that are currently in stock."
                  }
                }
              },
              required: ["product", "shortDescription", "price", "stock"]
            }
          }
        },
        required: ["categories"]
      }
    }
  }

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {"role": "system", "content": "You are a commerce administrator responsible for defining product categories for your company."},
      {"role": "user", "content": "Create a list of products and categories on the subject of: "+req.body.product}
    ],
    functions: [
      {name: "get_commerce_categories", "parameters": categorySchema}
    ],
    temperature: 0.6,
  });

  let categories = JSON.parse(response.choices[0].message.function_call.arguments).categories;
  if(debug) console.log(JSON.stringify(categories));
  

  res.status(200).json({result:JSON.stringify(categories)});
  
  let productCategories = [];

  for(let i = 0; categories.length>i; i++){  
    productCategories.push(categories[i].category);
  }

  let categoryDataStr =  {
    "Category Vocab": req.body.product + " Type",
    "Category Names": productCategories
  } 

  if(debug) console.log(categoryDataStr);

  /* Setup Vocabulary */

  const axios = require("axios");

  let apiPath = process.env.LIFERAY_PATH + "/o/headless-admin-taxonomy/v1.0/sites/" + process.env.LIFERAY_GLOBAL_SITE_ID + "/taxonomy-vocabularies";
  let vocabPostObj = {'name': req.body.product + ' Categories'};

  const usernamePasswordBuffer = Buffer.from( 
            process.env.LIFERAY_ADMIN_EMAIL_ADDRESS + 
            ':' + process.env.LIFERAY_ADMIN_PASSWORD);

  const base64data = usernamePasswordBuffer.toString('base64');

  let headerObj = {
    headers: {
    'Authorization': 'Basic ' + base64data, 
    'Content-Type': 'application/json'
    }
  };
  
  let apiRes = "";

  // wait for the vocab to complete before adding categories
  try {
    const vocabResponse = await axios.post(apiPath,
      vocabPostObj, 
      headerObj);
  
      if(debug) console.log(vocabResponse.data);
      apiRes = vocabResponse.data.id;
  }
  catch (error) {
    console.log(error);
    apiRes = error;

  }

  const categMap = new Map();

  if(debug) console.log("returned vocab key is " + apiRes);
  // create the categories for the vocabulary that was just generated
  let currCategory, currCategoryJson, categResponse;
  for(var i = 0; i < productCategories.length; i++) {

    currCategory = productCategories[i];

    currCategoryJson = {'taxonomyVocabularyId' : apiRes, 'name' : currCategory};
  
    apiPath = process.env.LIFERAY_PATH + "/o/headless-admin-taxonomy/v1.0/taxonomy-vocabularies/" + apiRes + "/taxonomy-categories";
    if(debug) console.log("creating category");
    if(debug) console.log(currCategoryJson);

    try {
      categResponse = await axios.post(apiPath,
        currCategoryJson, 
        headerObj);

        if(debug) console.log(categResponse.data.id + " is the id for " + currCategory);

      categMap.set(currCategory, categResponse.data.id);
    }
    catch(categError) {
      console.log(categError);
    }

    if(debug) console.log(categMap);
  }

  // add the products
  let j;
  let productDataList;
  let productName, shortDescription, productPrice, inventoryCount, productSku, productJson;
  let productResponse, productId, productCategoryJson;
  let categoryApiPath;

  let currCategoryId;
  for(i = 0; categories.length>i; i++){
    currCategory = categories[i].category;
    currCategoryId = categMap.get(currCategory);
    if(debug) console.log("category -- " + currCategory + ":" + currCategoryId);

    productDataList = categories[i].products;

    for(j = 0; j < productDataList.length; j++) {
      productName = productDataList[j].productName;
      shortDescription = productDataList[j].shortDescription;
      productPrice = productDataList[j].price;
      inventoryCount = productDataList[j].stock;
      productSku = productName.toLowerCase().replaceAll(' ', '-')

      productJson = {
        "active" : true,
        "catalogId" : process.env.LIFERAY_CATALOG_ID,
        "description" : {
          "en_US" : productName
        },
        "name" : {
          "en_US" : productName
        },
        "productStatus" : 0,
        "productType" : 'simple',
        "shortDescription" : {
          "en_US" : shortDescription
        },
        "skuFormatted" : productSku,
        "skus" : [{
          "price" : parseFloat(productPrice.replaceAll("$","")),
          "published" : true,
          "purchasable" : true,
          "sku" : productSku,
          "neverExpire" : true
        }],
        "categories" : [
          {
            "id" : categMap.get(currCategory)
          }
        ]

      }

      try {
        apiPath = process.env.LIFERAY_PATH + "/o/headless-commerce-admin-catalog/v1.0/products";

        if(debug) console.log("sending: "+ productName);
        if(debug) console.log(apiPath);
        if(debug) console.log(productJson);
        if(debug) console.log(headerObj);

        productResponse = await axios.post(apiPath, productJson, headerObj);

        //console.log(productResponse);

        productId = productResponse.data.productId;
        if(debug) console.log(productName + " created with id " + productId);
        productCategoryJson = {
          'id' : currCategoryId,
          'name' : currCategory,
          'siteId' : process.env.LIFERAY_GLOBAL_SITE_ID
        }

      }
      catch(productError) {
        console.log("error creating product " + productName + " -- " + productError);
      }
    }
  }
}



