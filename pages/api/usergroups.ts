import { AxiosInstance } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

import { axiosInstance } from "../../services/liferay";
import functions from "../../utils/functions";
import { logger } from "../../utils/logger";

const debug = logger("UserGroupAction");

export default async function UserGroupsAction(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const start = new Date().getTime();

  const openai = new OpenAI({
    apiKey: req.body.config.openAIKey,
  });

  debug(req.body);

  const usergroupsSchema = {
    properties: {
      usergroups: {
        description:
          "An array of " +
          req.body.userGroupNumber +
          " categories of system users within a company",
        items: {
          properties: {
            name: {
              description: "The name of the user group.",
              type: "string",
            },
          },
          required: ["name"],
          type: "object",
        },
        required: ["usergroups"],
        type: "array",
      },
    },
    type: "object",
  };

  const response = await openai.chat.completions.create({
    functions: [{ name: "get_usergroups", parameters: usergroupsSchema }],
    messages: [
      {
        content:
          "You are an employee manager responsible for listing the categories of system users within a company.",
        role: "system",
      },
      {
        content:
          "Create a list of " +
          req.body.userGroupNumber +
          " types of users for a company that provides " +
          req.body.userGroupTopic +
          ". " +
          "Do not include double quotes in the response.",
        role: "user",
      },
    ],
    model: req.body.config.model,
    temperature: 0.6,
  });

  let usergroups = JSON.parse(
    response.choices[0].message.function_call.arguments,
  ).usergroups;
  debug(JSON.stringify(usergroups));

  const axios = axiosInstance(req, res);

  await Promise.allSettled(
    usergroups.map((userGroup: any) => createUserGroup(axios, userGroup.name)),
  );

  let end = new Date().getTime();

  res.status(200).json({
    result: "Completed in " + functions.millisToMinutesAndSeconds(end - start),
  });
}

async function createUserGroup(axios: AxiosInstance, name: string) {
  try {
    const response = await axios.post(
      "/o/headless-admin-user/v1.0/user-groups",
      {
        name,
      },
    );

    return response.data.id;
  } catch (error) {
    console.log(error);
  }

  return 0;
}
