import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import request from "request";

import { axiosInstance } from "../../services/liferay";
import nextAxios from "../../services/next";
import functions from "../../utils/functions";
import { logger } from "../../utils/logger";

const debug = logger("Users AI - Action");

export default async function UsersAIAction(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  let start = new Date().getTime();

  const openai = new OpenAI({
    apiKey: req.body.config.openAIKey,
  });

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

  let userlist = JSON.parse(
    response.choices[0].message.function_call.arguments,
  ).users;
  let genderCount = {
    female: 0,
    male: 0,
  };

  for (let i = 0; i < userlist.length; i++) {
    debug(userlist[i].gender);

    let gender = userlist[i].gender;
    genderCount[gender] = genderCount[gender] + 1;
    delete userlist[i].gender;

    userlist[i].alternateName =
      userlist[i].givenName + "." + userlist[i].familyName;

    userlist[i].emailAddress =
      userlist[i].givenName +
      "." +
      userlist[i].familyName +
      "@" +
      req.body.emailPrefix;

    userlist[i].password = req.body.password;

    try {
      const response = await axios.post(
        "/o/headless-admin-user/v1.0/user-accounts",
        userlist[i],
      );

      debug(
        "Created user:" + response.data.id + ", " + response.data.alternateName,
      );

      let userImageApiPath =
        req.body.config.serverURL +
        "/o/headless-admin-user/v1.0/user-accounts/" +
        response.data.id +
        "/image";

      let userImagePath = await getImagePath(gender, genderCount[gender]);

      debug("userImageApiPath:" + userImageApiPath);
      debug("userImagePath:" + userImagePath);
      debug(process.cwd() + "/public/users/user-images/" + userImagePath);

      let fileStream = fs.createReadStream(
        process.cwd() + "/public/users/user-images/" + userImagePath,
      );
      const imgoptions = functions.getFilePostOptions(
        userImageApiPath,
        fileStream,
        "image",
        req.body.config.base64data,
      );

      request(imgoptions, function (err, res, body) {
        if (err) console.log(err);

        debug("Image Upload Complete");
      });

      successCount++;
    } catch (error) {
      errorCount++;
      console.log(
        error.code +
          " for user " +
          userlist[i].alternateName +
          " | " +
          userlist[i].emailAddress,
      );
    }
  }

  let end = new Date().getTime();

  res.status(200).json({
    result:
      successCount +
      " users added, " +
      errorCount +
      " errors in " +
      functions.millisToMinutesAndSeconds(end - start),
  });
}

async function getImagePath(gender, index) {
  const response = await nextAxios.post("/api/userimages", {
    gender: gender,
    index: index,
  });

  return response.data.result;
}
