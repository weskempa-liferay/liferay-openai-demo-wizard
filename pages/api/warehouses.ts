import { AxiosInstance } from "axios";
import OpenAI from "openai";

import { axiosInstance } from "../../services/liferay";
import functions from "../../utils/functions";
import { logger } from "../../utils/logger";

const debug = logger("WarehousesAction");

export default async function WarehousesAction(req, res) {
  const start = new Date().getTime();

  const openai = new OpenAI({
    apiKey: req.body.config.openAIKey,
  });

  const warehousesSchema = {
    properties: {
      locations: {
        description:
          "An array of " +
          req.body.warehouseNumber +
          " cities, regions, or counties within a region. ",
        items: {
          properties: {
            latitude: {
              description: "The latitude of the location.",
              type: "string",
            },
            longitude: {
              description: "The longitude of the location.",
              type: "string",
            },
            name: {
              description: "The name of the location.",
              type: "string",
            },
          },
          required: ["name", "latitude", "longitude"],
          type: "object",
        },
        type: "array",
      },
    },
    type: "object",
  };

  const response = await openai.chat.completions.create({
    functions: [{ name: "get_locations", parameters: warehousesSchema }],
    messages: [
      {
        content:
          "You are a helpful assistant tasked with listing cities, regions, or counties within an area.",
        role: "system",
      },
      {
        content:
          "Provide a list of " +
          req.body.warehouseNumber +
          " cities, regions, or counties with latitude and longitude within the region of " +
          req.body.warehouseRegion +
          ". ",
        role: "user",
      },
    ],
    //model: req.body.config.model,
    // Default 3.5 model no longer appears to provide useful results. Forcing a newer model until this is corrected.
    model: "gpt-4-turbo-preview",
    temperature: 0.6,
  });

  const warehouses = JSON.parse(
    response.choices[0].message.function_call.arguments,
  ).locations;

  debug(JSON.stringify(warehouses));

  const axios = axiosInstance(req, res);

  await Promise.allSettled(
    warehouses.map((warehouse: any) => createWarehouse(axios, warehouse)),
  );

  const end = new Date().getTime();

  res.status(200).json({
    result: "Completed in " + functions.millisToMinutesAndSeconds(end - start),
  });
}

async function createWarehouse(axios: AxiosInstance, warehouse) {
  debug(
    `Creating ${warehouse.name} with lat ${warehouse.latitude} long ${warehouse.longitude}`,
  );

  try {
    const response = await axios.post(
      "/o/headless-commerce-admin-inventory/v1.0/warehouses",
      {
        latitude: warehouse.latitude,
        longitude: warehouse.longitude,
        name: {
          en_US: warehouse.name,
        },
      },
    );

    return response.data.id;
  } catch (error) {
    console.log(error);
  }

  return 0;
}
