import axios from 'axios';
import OpenAI from 'openai';

import functions from '../utils/functions';
import { logger } from '../utils/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const debug = logger('WarehousesAction');

export default async function WarehousesAction(req, res) {
  const start = new Date().getTime();

  debug(req.body);

  const warehousesSchema = {
    properties: {
      locations: {
        description:  'An array of ' +
                      req.body.warehouseNumber +
                      ' locations a region',
        items: {
          properties: {
            name: {
              description: 'The name of the location.',
              type: 'string',
            },
            latitude: {
              description: 'The latitude of the location.',
              type: 'string',
            },
            longitude: {
              description: 'The longitude of the location.',
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
          'You are a helpful assistant tasked with listing locations within an area.',
        role: 'system',
      },
      {
        content:
          'Provide a list of ' +  req.body.warehouseNumber + ' locations with latitude and longitude within the region of ' +
          req.body.warehouseRegion + '. ',
        role: 'user',
      },
    ],
    model: 'gpt-3.5-turbo',
    temperature: 0.6,
  });

  let warehouses = JSON.parse(
    response.choices[0].message.function_call.arguments
  ).locations;
  debug(JSON.stringify(warehouses));


  for (let i = 0; i < warehouses.length; i++) {
    debug(warehouses[i]);

    const warehouseId = await createWarehouse(warehouses[i]);

  }

  let end = new Date().getTime();

  res.status(200).json({
    result: 'Completed in ' + functions.millisToMinutesAndSeconds(end - start),
  });
}

async function createWarehouse(warehouse) {
  debug('Creating ' + warehouse.name + ' with lat ' + warehouse.latitude + '  long ' + warehouse.longitude);

  
  const postBody = {
    name: {
      "en_US": warehouse.name,
    },
    latitude: warehouse.latitude,
    longitude: warehouse.longitude,
  };

  const orgApiPath =
    process.env.LIFERAY_PATH + '/o/headless-commerce-admin-inventory/v1.0/warehouses';
  const options = functions.getAPIOptions('POST', 'en-US');

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
