import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

import { axiosInstance } from "../../services/liferay";
import functions from "../../utils/functions";
import { logger } from "../../utils/logger";

const debug = logger("Accounts - Action");

export default async function Action(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  let start = new Date().getTime();

  const openai = new OpenAI({
    apiKey: req.body.config.openAIKey,
  });

  const accountSchema = {
    properties: {
      accounts: {
        description:
          "An array of " + req.body.accountNumber + " business accounts",
        items: {
          properties: {
            name: {
              description: "Name of the business.",
              type: "string",
            },
          },
          required: ["name"],
          type: "object",
        },
        required: ["accounts"],
        type: "array",
      },
    },
    type: "object",
  };

  const response = await openai.chat.completions.create({
    functions: [{ name: "get_accounts", parameters: accountSchema }],
    messages: [
      {
        content:
          "You are an account manager responsible for listing the active acccounts for your company.",
        role: "system",
      },
      {
        content:
          "Create a list of active acccounts for a company that provides " +
          req.body.accountTopic,
        role: "user",
      },
    ],
    model: req.body.config.model,
    temperature: 0.6,
  });

  const accounts =
    JSON.parse(response.choices[0].message.function_call.arguments).accounts ||
    [];

  const axios = axiosInstance(req, res);

  debug(JSON.stringify(accounts));

  for (const account of accounts) {
    try {
      const response = await axios.post(
        "/o/headless-commerce-admin-account/v1.0/accounts",
        {
          externalReferenceCode: account.name
            .replaceAll(" ", "-")
            .toLowerCase(),
          name: account.name,
          type: 2,
        },
      );

      debug(JSON.stringify(response.data));
    } catch (error) {
      console.log(error);
    }
  }

  let end = new Date().getTime();

  res.status(200).json({
    result: "Completed in " + functions.millisToMinutesAndSeconds(end - start),
  });
}
