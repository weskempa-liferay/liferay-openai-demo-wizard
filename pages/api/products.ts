import { Configuration, OpenAIApi } from "openai";



const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {

  /* Get OpenAI Content based on Theme */

  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: reviewPrompt(req.body.product),
    max_tokens: 2000,
    temperature: 0.6,
  });
  res.status(200).json({ result: completion.data.choices[0].text });

  let productData = JSON.parse(completion.data.choices[0].text).categories;
  
  let productCategories = [];

  for(let i = 0; productData.length>i; i++){
    productCategories.push(productData[i].categoryName);
  }

  let categoryDataStr =  {
    "Category Vocab": req.body.product + " Type",
    "Category Names": productCategories
  } 


  console.log(categoryDataStr);

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
  
      console.log(vocabResponse.data);
      apiRes = vocabResponse.data.id;
  }
  catch (error) {
    console.log(error);
    apiRes = error;

  }

  const categMap = new Map();

  console.log("returned vocab key is " + apiRes);
  // create the categories for the vocabulary that was just generated
  let currCategory, currCategoryJson, categResponse;
  for(var i = 0; i < productCategories.length; i++) {

    currCategory = productCategories.pop();

    currCategoryJson = {'taxonomyVocabularyId' : apiRes, 'name' : currCategory};
  
    apiPath = process.env.LIFERAY_PATH + "/o/headless-admin-taxonomy/v1.0/taxonomy-vocabularies/" + apiRes + "/taxonomy-categories";
    console.log("creating category");
    console.log(currCategoryJson);

    try {
      categResponse = await axios.post(apiPath,
        currCategoryJson, 
        headerObj);

      console.log(categResponse.data.id + " is the id for " + currCategory);

      categMap.set(currCategory, categResponse.data.id);
    }
    catch(categError) {
      console.log(categError);
    }

    console.log(categMap);
  }

  // add the products
  let j;
  let productDataList;
  var productName, productPrice, inventoryCount;
  var productSku, productJson;

  let productResponse;

  for(i = 0; productData.length>i; i++){
    productDataList = productData[i].products;
    for(j = 0; j < productDataList.length; j++) {
      productName = productDataList[j].productName;
      productPrice = productDataList[j].price;
      inventoryCount = productDataList[j].stock;
      productSku = productName.toLowerCase().replaceAll(' ', '-')

      productJson = {
        'active' : true,
        'catalogId' : process.env.LIFERAY_CATALOG_ID,
        'description' : {
          'en_US' : productName
        },
        'name' : {
          'en_US' : productName
        },
        'productStatus' : 0,
        'productType' : 'simple',
        'shortDescription' : {
          'en_US' : productName
        },
        'skuFormatted' : productSku,
        'skus' : [{
          'price' : productPrice,
          'published' : true,
          'purchasable' : true,
          'sku' : productSku,
          'neverExpire' : true
        }]

      }

      try {
        apiPath = process.env.LIFERAY_PATH + "/o/headless-commerce-admin-catalog/v1.0/products";

        productResponse = await axios.post(apiPath, productJson, headerObj);

        console.log(productResponse);
      }
      catch(productError) {
        console.log("error creating product " + productName + " -- " + productError);
      }
    }
  }


  //res.status(200).json({ result: apiRes });

/*
  //const https = require("https");
  const http = require('node:http');

  //http://localhost:8080/o/headless-admin-taxonomy/v1.0/sites/20120/taxonomy-vocabularies

  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/o/headless-admin-taxonomy/v1.0/sites/20120/taxonomy-vocabularies',
    method: 'POST',
    headers: new Headers({
      'Authorization': 'Basic ' + btoa('test@liferay.com:portal4all'), 
      'Content-Type': 'application/json'
    })
  }
  
  const request = http
    .request(options, resp => {
      // log the data
      resp.on("data", d => {
        console.log("DATA: "+d);
      });
    })
    .on("error", err => {
      console.log("Error: " + err.message);
    });

    request.write("{'name':'"+req.body.product + " Type'}");
    request.end();


    console.log("End of code");
    */


}

function reviewPrompt(productName) {
  return `company theme: Furniture
  json product list:
  {
    "categories": [
      {
        "categoryName": "Living Room Furniture",
        "products": [
          {
            "productName": "Sofa",
            "price": 499.99,
            "stock": 120
          },
          {
            "productName": "Coffee Table",
            "price": 149.99,
            "stock": 200
          }
        ]
      },
      {
        "categoryName": "Bedroom Furniture",
        "products": [
          {
            "productName": "Bed Frame",
            "price": 299.99,
            "stock": 100
          },
          {
            "productName": "Dresser",
            "price": 199.99,
            "stock": 80
          }
        ]
      },
      {
        "categoryName": "Dining Room Furniture",
        "products": [
          {
            "productName": "Dining Table",
            "price": 349.99,
            "stock": 60
          },
          {
            "productName": "Dining Chairs",
            "price": 79.99,
            "stock": 120
          }
        ]
      },
      {
        "categoryName": "Office Furniture",
        "products": [
          {
            "productName": "Desk",
            "price": 229.99,
            "stock": 90
          },
          {
            "productName": "Office Chair",
            "price": 129.99,
            "stock": 110
          }
        ]
      },
      {
        "categoryName": "Outdoor Furniture",
        "products": [
          {
            "productName": "Patio Set",
            "price": 599.99,
            "stock": 40
          },
          {
            "productName": "Adirondack Chair",
            "price": 79.99,
            "stock": 60
          }
        ]
      }
    ]
  }  
  
  company theme: ${productName}
  json product list:`;
}



