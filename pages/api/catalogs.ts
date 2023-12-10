import OpenAI  from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function (req, res) {
    let response = await getCatalogList();
    res.status(200).json(response);
}

async function getCatalogList(){

  const axios = require("axios");

  const usernamePasswordBuffer = Buffer.from( 
      process.env.LIFERAY_ADMIN_EMAIL_ADDRESS + 
      ':' + process.env.LIFERAY_ADMIN_PASSWORD);
      const base64data = usernamePasswordBuffer.toString('base64');

  let catalogApiPath = process.env.LIFERAY_PATH + "/o/headless-commerce-admin-catalog/v1.0/catalogs";

  let options = {
      method: "GET",
      port: 443,
      headers: {
          'Authorization': 'Basic ' + base64data,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      }
  };

  const response = await axios.get(catalogApiPath, options);

  return response.data.items;
}
