import { NextApiRequest, NextApiResponse } from "next";

import schema, { z } from "../../schemas/zod";
import { axiosInstance } from "../../services/liferay";
import { logger } from "../../utils/logger";

const debug = logger("Environment - Action");

const STATE_OK = "OK";
const STATE_NOT_ADMIN = "NOT ADMIN";
const STATE_CANNOT_CONNECT = "CANNOT CONNECT";

type ConfigBody = z.infer<typeof schema.config>;

export default async function Action(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { authenticationType, base64data, login, openAIKey, serverURL } =
    req.body as ConfigBody;

  let message = "";
  let status = "error";

  if (authenticationType === "basic" && !base64data?.trim()) {
    message =
      "<b>Login and password is required.</b> Please complete the configuration. (click here)";
  } else if (openAIKey.length == 0) {
    message =
      "<b>OpenAI API key is required.</b> Please add an api key to the configuration. (click here)";
  } else if (serverURL.length == 0) {
    message =
      "<b>A Liferay instance serverURL is required.</b> Please add it to the configuration. (click here)";
  } else {
    let test = await isConnected(req, res);
    if (test == STATE_CANNOT_CONNECT) {
      message =
        "Cannot connect to <b>" +
        serverURL +
        "</b> with user <b>" +
        login +
        "</b> Please complete configuration. (click here)";
    } else if (test == STATE_NOT_ADMIN) {
      message =
        "User <b>" + login + "</b> is not an admin. An admin user is required.";
    } else if (test == STATE_OK) {
      message =
        "Connected to <b>" + serverURL + "</b> with user <b>" + login + "</b>";
      status = "connected";
    }
  }

  res.status(200).json({ result: message, status: status });
}

async function isConnected(request: NextApiRequest, response: NextApiResponse) {
  const axios = axiosInstance(request, response);

  try {
    const response = await axios.get(
      "/o/headless-admin-user/v1.0/my-user-account",
    );

    let userRoles = response.data.roleBriefs;

    for (let i = 0; i < userRoles.length; i++) {
      if (userRoles[i].name == "Administrator") {
        return STATE_OK;
      }
    }

    return STATE_NOT_ADMIN;
  } catch (error) {
    debug({ error });
    return STATE_CANNOT_CONNECT;
  }
}
