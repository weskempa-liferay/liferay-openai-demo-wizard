import { Configuration, OpenAIApi } from "openai";



const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {


  const axios = require("axios");

  let apiPath = "http://localhost:8080/o/headless-admin-taxonomy/v1.0/sites/20120/taxonomy-vocabularies";
  let vocabPostObj = {'name': req.body.product + ' Type'};
  let headers = {
    'Authorization': 'Basic ' + btoa('test@liferay.com:test'), 
    'Content-Type': 'application/json'
  };
  let apiRes = "";

  axios.post(apiPath,
    vocabPostObj, 
    headers).then(
    function (response) {
      console.log(response);
      apiRes = response;
    })
    .catch(function (error) {
      console.log(error);
      apiRes = error;
    });

  res.status(200).json({ result: apiRes });

  /*const completion = await openai.createCompletion({
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

*/
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



