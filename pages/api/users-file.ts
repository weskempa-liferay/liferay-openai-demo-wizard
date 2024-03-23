import { AxiosInstance } from "axios";
import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import request from "request";

import { axiosInstance } from "../../services/liferay";
import functions from "../../utils/functions";
import { logger } from "../../utils/logger";

const debug = logger("Users File - Action");

export default async function UsersFileAction(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const start = new Date().getTime();
  let successCount = 0;
  let errorCount = 0;

  let userlist = req.body.csvoutput;

  debug(userlist);

  const axios = axiosInstance(req, res, {
    "Accept-Language": req.body.defaultLanguage,
  });

  const roleList = await getRoleList(axios);

  let userImagePath = "";

  for (let i = 0; i < userlist.length; i++) {
    userImagePath = userlist[i].imageFile;

    delete userlist[i].imageFile;

    debug(userlist[i].emailAddress + ", userImagePath: " + userImagePath);

    debug("sending:", userlist[i]);

    try {
      const response = await axios.post(
        "/o/headless-admin-user/v1.0/user-accounts",
        JSON.stringify(userlist[i]),
      );

      debug("Saved user: " + response.data.id);

      const roleBriefs = getRoleBriefs(userlist[i].jobTitle, roleList);

      if (roleBriefs.length > 0) {
        await axios.post(
          `/o/headless-admin-user/v1.0/roles/${roleBriefs[0].id}/association/user-account/${response.data.id}`,
        );

        debug("Role Association Complete");
      }

      if (userImagePath.length > 0) {
        debug(process.cwd() + "/public/users/user-images/" + userImagePath);

        let fileStream = fs.createReadStream(
          process.cwd() + "/public/users/user-images/" + userImagePath,
        );

        const imgoptions = functions.getFilePostOptions(
          req.body.config.serverURL +
            "/o/headless-admin-user/v1.0/user-accounts/" +
            response.data.id +
            "/image",
          fileStream,
          "image",
          req.body.config.base64data,
        );

        request(imgoptions, function (err, res, body) {
          if (err) debug(err);

          debug("Image Upload Complete");
        });
      }

      successCount++;
    } catch (error) {
      errorCount++;

      console.log(error);
    }
  }

  const end = new Date().getTime();

  res.status(200).json({
    result: `${successCount} users added, ${errorCount} errors in ${functions.millisToMinutesAndSeconds(end - start)}`,
  });
}

async function getRoleList(axios: AxiosInstance) {
  const { data } = await axios.get("/o/headless-admin-user/v1.0/roles");

  return data.items;
}

function getRoleBriefs(roleName: string, roleList: any[]) {
  let roleBriefs = [];

  debug("Checking against " + roleList.length + " roles.");

  for (let i = 0; i < roleList.length; i++) {
    if (roleName == roleList[i].name) {
      debug("Match on role id:" + roleList[i].id);

      let roleBrief = { id: roleList[i].id };
      roleBriefs.push(roleBrief);
    }
  }

  return roleBriefs;
}
