var functions = require('../utils/functions');

const STATE_OK = 'OK';
const STATE_NOT_ADMIN = 'NOT ADMIN';
const STATE_CANNOT_CONNECT = 'CANNOT CONNECT';

export default async function Action(req, res) {
  const openAPIKey = process.env.OPENAI_API_KEY;
  const path = process.env.LIFERAY_PATH;
  const emailAddress = process.env.LIFERAY_ADMIN_EMAIL_ADDRESS;
  const password = process.env.LIFERAY_ADMIN_PASSWORD;

  let message = '';
  let status = 'error';

  if (openAPIKey.length == 0) {
    message =
      '<b>OpenAI API key is required.</b> Please add a api key to your .env properties file.';
  } else if (path.length == 0) {
    message =
      '<b>A Liferay instance path is required.</b> Please add it to your .env properties file.';
  } else if (emailAddress.length == 0) {
    message =
      '<b>An admin user email address is required.</b> Please add it to your .env properties file.';
  } else if (password.length == 0) {
    message =
      '<b>A password is required.</b> Please add a password to your .env properties file.';
  } else {
    let test = await isConnected();
    if (test == STATE_CANNOT_CONNECT) {
      message =
        'Cannot connect to <b>' +
        path +
        '</b> with user <b>' +
        emailAddress +
        '</b>';
    } else if (test == STATE_NOT_ADMIN) {
      message =
        'User <b>' +
        emailAddress +
        '</b> is not an admin. An admin user is required.';
    } else if (test == STATE_OK) {
      message =
        'Connected to <b>' +
        path +
        '</b> with user <b>' +
        emailAddress +
        '</b>';
      status = 'connected';
    }
  }

  res.status(200).json({ result: message, status: status });
}

async function isConnected() {
  const axios = require('axios');

  let myUserAccountPath =
    process.env.LIFERAY_PATH + '/o/headless-admin-user/v1.0/my-user-account';

  let options = functions.getAPIOptions('GET', 'en-US');

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
    return STATE_CANNOT_CONNECT;
  }
}
