import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

import schema, { z } from "../../schemas/zod";
import { axiosInstance } from "../../services/liferay";
import functions from "../../utils/functions";
import { logger } from "../../utils/logger";

const debug = logger("ObjectsAction");

export default async function ObjectsAction(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  let start = new Date().getTime();

  const openai = new OpenAI({
    apiKey: req.body.config.openAIKey,
  });

  const { aiEndpoint, aiRequest, aiRole, objectFields } = req.body as z.infer<
    typeof schema.objects
  >;

  const requiredList = [];

  for (let i = 0; i < objectFields.length; i++) {
    requiredList.push(objectFields[i].fieldName);
  }

  const objectSchema = {
    properties: {
      resultlist: {
        description: aiRequest,
        items: {
          properties: objectFields,
          required: requiredList,
          type: "object",
        },
        required: ["list"],
        type: "array",
      },
    },
    type: "object",
  };

  debug(objectSchema);

  const response = await openai.chat.completions.create({
    functions: [{ name: "get_objects", parameters: objectSchema }],
    messages: [
      { content: aiRole, role: "system" },
      { content: aiRequest, role: "user" },
    ],
    model: req.body.config.model,
    temperature: 0.6,
  });

  let resultlist = JSON.parse(
    response.choices[0].message.function_call.arguments,
  ).resultlist;

  debug(JSON.stringify(resultlist));

  const axios = axiosInstance(req, res);

  try {
    const response = await axios.post(aiEndpoint, resultlist);

    debug(response.data);
  } catch (error) {
    console.log(error);
  }

  const end = new Date().getTime();

  res.status(200).json({
    result: "Completed in " + functions.millisToMinutesAndSeconds(end - start),
  });
}
