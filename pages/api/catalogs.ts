var functions = require('../utils/functions');

export default async function (req, res) {
    let response = await getCatalogList();
    res.status(200).json(response);
}

async function getCatalogList(){

  const axios = require("axios");

  let catalogApiPath = process.env.LIFERAY_PATH + "/o/headless-commerce-admin-catalog/v1.0/catalogs";

  let options = functions.getAPIOptions("GET","en-US");

  const response = await axios.get(catalogApiPath, options);

  return response.data.items;
}