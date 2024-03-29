import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

import schema, { z } from "../../schemas/zod";
import { axiosInstance } from "../../services/liferay";
import functions from "../../utils/functions";
import { logger } from "../../utils/logger";
import { getImageList } from "./userimages";

const debug = logger("Users AI - Action");

export default async function UsersAIAction(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  let start = new Date().getTime();

  const openai = new OpenAI({
    apiKey: req.body.config.openAIKey,
  });

  const userAIPayload = req.body as z.infer<typeof schema.userAI>;

  const axios = axiosInstance(req, res);

  debug(req.body);

  let successCount = 0;
  let errorCount = 0;

  const userSchema = {
    properties: {
      users: {
        description:
          "An array of " +
          req.body.userNumber +
          " example users that will be added to the portal for demonstration",
        items: {
          properties: {
            birthDate: {
              description:
                "The user's birthday. It needs to be supplied in the format YYYY-MM-DD",
              type: "string",
            },
            familyName: {
              description:
                "The user's last name. Do not use the name Smith or Doe.",
              type: "string",
            },
            gender: {
              description: "This is the user's gender.",
              enum: ["male", "female"],
              type: "string",
            },
            givenName: {
              description:
                "The user's first name. Do not use the names Jane or John.",
              type: "string",
            },
            jobTitle: {
              description: "The user's job title.",
              type: "string",
            },
          },
          required: [
            "birthDate",
            "familyName",
            "givenName",
            "gender",
            "jobTitle",
          ],
          type: "object",
        },
        required: ["users"],
        type: "array",
      },
    },
    type: "object",
  };

  const response = await openai.chat.completions.create({
    functions: [{ name: "get_users", parameters: userSchema }],
    messages: [
      {
        content:
          "You are a system administrator responsible for adding users to a portal.",
        role: "system",
      },
      {
        content:
          "Create a list of example users to be added to the portal for demonstration. Do not use the first or last names John, Jane, Smith, or Doe. Return only the result of the get_users function.",
        role: "user",
      },
    ],
    model: req.body.config.model,
    temperature: 0.6,
  });

  const users =
    JSON.parse(response.choices[0].message.function_call.arguments).users || [];

  const genderCount = {
    female: 0,
    male: 0,
  };

  for (const user of users) {
    const gender = user.gender;

    genderCount[gender] = genderCount[gender] + 1;

    delete user.gender;

    user.alternateName = `${user.givenName}.${user.familyName}.${new Date().getTime()}`;
    user.emailAddress = `${user.givenName}.${new Date().getTime()}-${user.familyName}@${userAIPayload.emailPrefix}`;
    user.password = userAIPayload.password;

    try {
      const response = await axios.post(
        "/o/headless-admin-user/v1.0/user-accounts",
        user,
      );

      debug(
        `Created user: ${response.data.id}, ${response.data.alternateName}`,
      );

      const userImagePath = await getImagePath(gender, 0);

      console.log(userImagePath);

      debug(process.cwd() + "/public/users/user-images/" + userImagePath);

      const data = fs.readFileSync(
        process.cwd() + "/public/users/user-images/" + userImagePath,
      );

      const uint8Array = new Uint8Array(data);
      const blob = new Blob([uint8Array]);

      const formData = new FormData();

      formData.append("image", blob);

      console.log("Start Upload");

      await axios.post(
        `/o/headless-admin-user/v1.0/user-accounts/${response.data.id}/image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      debug("Image Upload Complete");

      successCount++;
    } catch (error) {
      errorCount++;
      console.log(error.response?.data);
      console.log(
        `${error.message} for user ${user.alternateName} | ${user.emailAddress}`,
      );
    }
  }

  const end = new Date().getTime();

  res.status(200).json({
    result: `${successCount} users added, ${errorCount} errors in ${functions.millisToMinutesAndSeconds(end - start)}`,
  });
}

async function getImagePath(gender: string, index: number) {
  const result = await getImageList(gender);

  return result[index % 6];
}
