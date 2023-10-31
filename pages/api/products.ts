import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: reviewPrompt(req.body.product),
    max_tokens: 2000,
    temperature: 0.6,
  });
  res.status(200).json({ result: completion.data.choices[0].text });
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



