import axios from 'axios';

import functions from '../../utils/functions';
import { logger } from '../../utils/logger';

const debug = logger('Environment - Action');

const STATE_OK = 'OK';
const STATE_NOT_ADMIN = 'NOT ADMIN';
const STATE_CANNOT_CONNECT = 'CANNOT CONNECT';

export default async function Action(req, res) {

  const reqObj = JSON.parse(req.body);
  const openAPIKey = reqObj.openAIKey;
  const path = reqObj.serverURL;
  const base64data = reqObj.base64data;
  const login = reqObj.login;

  let message = '';
  let status = 'error';

  if (base64data.length == 0) {
    message =
      '<b>Login and password is required.</b> Please complete the configuration. (click here)';
  } else if (openAPIKey.length == 0) {
    message =
      '<b>OpenAI API key is required.</b> Please add an api key to the configuration. (click here)';
  } else if (path.length == 0) {
    message =
      '<b>A Liferay instance path is required.</b> Please add it to the configuration. (click here)';
  } else {
    let test = await isConnected(path, base64data);
    if (test == STATE_CANNOT_CONNECT) {
      message =
        'Cannot connect to <b>' +
        path +
        '</b> with user <b>' +
        login +
        '</b> Please complete configuration. (click here)';
    } else if (test == STATE_NOT_ADMIN) {
      message =
        'User <b>' +
        login +
        '</b> is not an admin. An admin user is required.';
    } else if (test == STATE_OK) {
      message =
        'Connected to <b>' +
        path +
        '</b> with user <b>' +
        login +
        '</b>';
      status = 'connected';
    }
  }

  res.status(200).json({ result: message, status: status });
}

async function isConnected(path, base64data) {
  let myUserAccountPath =
      path + '/o/headless-admin-user/v1.0/my-user-account';

  let options = functions.getAPIOptions('GET', 'en-US', base64data);

  try {
    const response = await axios.get(myUserAccountPath, options);

    let userRoles = response.data.roleBriefs;

    for (let i = 0; i < userRoles.length; i++) {
      if (userRoles[i].name == 'Administrator') {
        return STATE_OK;
      }
    }

    return STATE_NOT_ADMIN;
  } catch (error) {
    debug(error);
    return STATE_CANNOT_CONNECT;
  }
}
