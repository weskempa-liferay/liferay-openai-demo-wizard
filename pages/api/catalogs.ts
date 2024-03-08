import axios from 'axios';

import functions from '../../utils/functions';

export default async function Action(req, res) {
  const config = JSON.parse(req.body);
  const response = await getCatalogList(config);

  console.log(config);

  res.status(200).json(response);
}

async function getCatalogList(config) {
  console.log(config);
  const catalogApiPath =
    config.serverURL +
    '/o/headless-commerce-admin-catalog/v1.0/catalogs';

  let options = functions.getAPIOptions('GET', 'en-US', config.base64data);

  const response = await axios.get(catalogApiPath, options);

  return response.data.items;
}
