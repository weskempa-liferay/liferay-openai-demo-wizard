import axios from 'axios';
import OpenAI from 'openai';

import functions from '../../utils/functions';
import { logger } from '../../utils/logger';

const debug = logger('WarehousesAction');

export default async function WarehousesAction(req, res) {
  const start = new Date().getTime();

  const openai = new OpenAI({
    apiKey: req.body.config.openAIKey,
  });

  debug(req.body);

  const warehousesSchema = {
    properties: {
      locations: {
        description:
          'An array of ' +
          req.body.warehouseNumber +
          ' cities, regions, or counties within a region. ',
        items: {
          properties: {
            latitude: {
              description: 'The latitude of the location.',
              type: 'string',
            },
            longitude: {
              description: 'The longitude of the location.',
              type: 'string',
            },
            name: {
              description: 'The name of the location.',
              type: 'string',
            },
          },
          required: ['name', 'latitude', 'longitude'],
          type: 'object',
        },
        type: 'array',
      },
    },
    type: 'object',
  };

  const response = await openai.chat.completions.create({
    functions: [{ name: 'get_locations', parameters: warehousesSchema }],
    messages: [
      {
        content:
          'You are a helpful assistant tasked with listing cities, regions, or counties within an area.',
        role: 'system',
      },
      {
        content:
          'Provide a list of ' +
          req.body.warehouseNumber +
          ' cities, regions, or counties with latitude and longitude within the region of ' +
          req.body.warehouseRegion +
          '. ',
        role: 'user',
      },
    ],
    //model: req.body.config.model,
    // Default 3.5 model no longer appears to provide useful results. Forcing a newer model until this is corrected.
    model: 'gpt-4-turbo-preview',
    temperature: 0.6,
  });

  let warehouses = JSON.parse(
    response.choices[0].message.function_call.arguments
  ).locations;
  debug(JSON.stringify(warehouses));

  for (let i = 0; i < warehouses.length; i++) {
    debug(warehouses[i]);

    const warehouseId = await createWarehouse(req, warehouses[i]);
  }

  let end = new Date().getTime();

  res.status(200).json({
    result: 'Completed in ' + functions.millisToMinutesAndSeconds(end - start),
  });
}

async function createWarehouse(req, warehouse) {
  debug(
    'Creating ' +
      warehouse.name +
      ' with lat ' +
      warehouse.latitude +
      '  long ' +
      warehouse.longitude
  );

  const postBody = {
    latitude: warehouse.latitude,
    longitude: warehouse.longitude,
    name: {
      en_US: warehouse.name,
    },
  };

  const orgApiPath =
    req.body.config.serverURL +
    '/o/headless-commerce-admin-inventory/v1.0/warehouses';
  const options = functions.getAPIOptions('POST', 'en-US', req.body.config.base64data);

  let returnid = 0;

  try {
    const response = await axios.post(orgApiPath, postBody, options);

    returnid = response.data.id;

    debug('returned id:' + returnid);
  } catch (error) {
    console.log(error);
  }

  return returnid;
}
