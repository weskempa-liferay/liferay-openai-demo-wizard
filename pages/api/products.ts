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

    currCategory = productCategories[i];

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
  let productName, shortDescription, productPrice, inventoryCount, productSku, productJson;
  let productResponse, productId, productCategoryJson;
  let categoryApiPath;

  let currCategoryId;
  for(i = 0; productData.length>i; i++){
    currCategory = productData[i].categoryName;
    currCategoryId = categMap.get(currCategory);
    console.log("category -- " + currCategory + ":" + currCategoryId);

    productDataList = productData[i].products;

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
          "price" : productPrice,
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

        console.log("sending: "+ productName);
        console.log(apiPath);
        console.log(productJson);
        console.log(headerObj);

        productResponse = await axios.post(apiPath, productJson, headerObj);

        //console.log(productResponse);

        productId = productResponse.data.productId;
        console.log(productName + " created with id " + productId);
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
            "stock": 120,
            "shortDescription": "Indulge in comfort and style with our luxurious sofa collection." 
          },
          {
            "productName": "Coffee Table",
            "price": 149.99,
            "stock": 200,
            "shortDescription": "Transform your living room into a haven of elegance with our exquisite coffee tables." 
          }
        ]
      },
      {
        "categoryName": "Bedroom Furniture",
        "products": [
          {
            "productName": "Bed Frame",
            "price": 299.99,
            "stock": 100,
            "shortDescription": "Upgrade your sleep sanctuary with our sleek and sturdy bed frames." 
          },
          {
            "productName": "Dresser",
            "price": 199.99,
            "stock": 80,
            "shortDescription": "Elevate your bedroom organization with our chic and functional dressers." 
          }
        ]
      },
      {
        "categoryName": "Dining Room Furniture",
        "products": [
          {
            "productName": "Dining Table",
            "price": 349.99,
            "stock": 60,
            "shortDescription": "Set the stage for unforgettable gatherings with our stunning dining tables." 
          },
          {
            "productName": "Dining Chairs",
            "price": 79.99,
            "stock": 120,
            "shortDescription": "Take a seat in style with our sophisticated dining chairs." 
          }
        ]
      },
      {
        "categoryName": "Office Furniture",
        "products": [
          {
            "productName": "Desk",
            "price": 229.99,
            "stock": 90,
            "shortDescription": "Revolutionize your workspace with our sleek and functional office desks." 
          },
          {
            "productName": "Office Chair",
            "price": 129.99,
            "stock": 110,
            "shortDescription": "Experience unparalleled comfort and productivity with our ergonomic office chairs." 
          }
        ]
      },
      {
        "categoryName": "Outdoor Furniture",
        "products": [
          {
            "productName": "Patio Set",
            "price": 599.99,
            "stock": 40,
            "shortDescription": "Transform your outdoor space into a haven of relaxation with our stylish patio sets." 
          },
          {
            "productName": "Adirondack Chair",
            "price": 79.99,
            "stock": 60,
            "shortDescription": "Unwind in timeless style with our classic Adirondack chairs." 
          }
        ]
      }
    ]
  }  
  
  company theme: ${productName}
  json product list:`;
}



