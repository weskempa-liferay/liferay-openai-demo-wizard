import axios from 'axios';
import fs from 'fs';
import request from 'request';

import functions from '../utils/functions';
import { logger } from '../utils/logger';

const debug = logger('UsersFileAction');

export default async function UsersFileAction(req, res) {
  let start = new Date().getTime();
  let successCount = 0;
  let errorCount = 0;

  let userlist = req.body.csvoutput;

  debug(userlist);

  let roleList = await getRoleList();

  let userApiPath =
    process.env.LIFERAY_PATH + '/o/headless-admin-user/v1.0/user-accounts';
  let userImagePath = '';

  for (let i = 0; i < userlist.length; i++) {
    userImagePath = userlist[i].imageFile;

    delete userlist[i].imageFile;

    if (debug)
      console.log(
        userlist[i].emailAddress + ', userImagePath: ' + userImagePath
      );

    debug('sending:', userlist[i]);

    try {
      let options = functions.getAPIOptions('POST', 'en-US');

      const response = await axios.post(
        userApiPath,
        JSON.stringify(userlist[i]),
        options
      );

      debug('Saved user: ' + response.data.id);

      let roleBriefs = getRoleBriefs(userlist[i].jobTitle, roleList, debug);

      if (roleBriefs.length > 0) {
        let userRoleApiPath =
          process.env.LIFERAY_PATH +
          '/o/headless-admin-user/v1.0/roles/' +
          roleBriefs[0].id +
          '/association/user-account/' +
          response.data.id;

        debug(userRoleApiPath);

        const options = functions.getAPIOptions(
          'POST',
          req.body.defaultLanguage
        );

        await axios.post(userRoleApiPath, '', options);

        debug('Role Association Complete');
      }

      if (userImagePath.length > 0) {
        let userImageApiPath =
          process.env.LIFERAY_PATH +
          '/o/headless-admin-user/v1.0/user-accounts/' +
          response.data.id +
          '/image';

        debug(userImageApiPath);
        if (debug)
          console.log(
            process.cwd() + '/public/users/user-images/' + userImagePath
          );

        let fileStream = fs.createReadStream(
          process.cwd() + '/public/users/user-images/' + userImagePath
        );
        const imgoptions = functions.getFilePostOptions(
          userImageApiPath,
          fileStream,
          'image'
        );

        request(imgoptions, function (err, res, body) {
          if (err) console.log(err);

          debug('Image Upload Complete');
        });
      }
      successCount++;
    } catch (error) {
      errorCount++;
      console.log(error);
    }
  }

  let end = new Date().getTime();

  res.status(200).json({
    result:
      successCount +
      ' users added, ' +
      errorCount +
      ' errors in ' +
      functions.millisToMinutesAndSeconds(end - start),
  });
}

async function getRoleList() {
  let userApiPath =
    process.env.LIFERAY_PATH + '/o/headless-admin-user/v1.0/roles';

  let roleoptions = functions.getAPIOptions('GET', 'en-US');

  const roleresponse = await axios.get(userApiPath, roleoptions);

  return roleresponse.data.items;
}

function getRoleBriefs(roleName, roleList, debug) {
  let roleBriefs = [];

  debug('Checking against ' + roleList.length + ' roles.');

  for (let i = 0; i < roleList.length; i++) {
    if (roleName == roleList[i].name) {
      debug('Match on role id:' + roleList[i].id);

      let roleBrief = { id: roleList[i].id };
      roleBriefs.push(roleBrief);
    }
  }

  return roleBriefs;
}
