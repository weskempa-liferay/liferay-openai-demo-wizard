import axios from 'axios';

import functions from '../utils/functions';

export default async function Action(req, res) {
  const response = await getCatalogList();

  res.status(200).json(response);
}

async function getCatalogList() {
  const catalogApiPath =
    process.env.LIFERAY_PATH +
    '/o/headless-commerce-admin-catalog/v1.0/catalogs';

  let options = functions.getAPIOptions('GET', 'en-US');

  const response = await axios.get(catalogApiPath, options);

  return response.data.items;
}
