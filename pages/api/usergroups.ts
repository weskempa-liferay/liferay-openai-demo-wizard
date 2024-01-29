import axios from 'axios';
import OpenAI from 'openai';

import functions from '../utils/functions';
import { logger } from '../utils/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const debug = logger('UserGroupAction');

export default async function UserGroupsAction(req, res) {
  const start = new Date().getTime();

  debug(req.body);

  const usergroupsSchema = {
    properties: {
      usergroups: {
        description: 'An array of ' + req.body.userGroupNumber + ' categories of system users within a company',
        items: {
          properties: {
            name: {
              description: 'The name of the user group.',
              type: 'string',
            },
          },
          required: ['name'],
          type: 'object',
        },
        required: ['usergroups'],
        type: 'array',
      },
    },
    type: 'object',
  };

  const response = await openai.chat.completions.create({
    functions: [{ name: 'get_usergroups', parameters: usergroupsSchema }],
    messages: [
      {
        content:
          'You are an employee manager responsible for listing the categories of system users within a company.',
        role: 'system',
      },
      {
        content:
          'Create a list of ' + req.body.userGroupNumber + ' types of users for a company that provides ' +
          req.body.userGroupTopic +
          '. ' +
          'Do not include double quotes in the response.',
        role: 'user',
      },
    ],
    model: req.body.config.model,
    temperature: 0.6,
  });

  let usergroups = JSON.parse(
    response.choices[0].message.function_call.arguments
  ).usergroups;
  debug(JSON.stringify(usergroups));

  for (let i = 0; i < usergroups.length; i++) {
    debug(usergroups[i]);

    const userGroupId = await createUserGroup(usergroups[i], false);
  }

  let end = new Date().getTime();

  res.status(200).json({
    result: 'Completed in ' + functions.millisToMinutesAndSeconds(end - start),
  });
}

async function createUserGroup(usergroup, parentOrgId) {
  debug('Creating ' + usergroup.name + ' with parent ' + parentOrgId);

  const postBody = {
    name: usergroup.name
  };

  const orgApiPath =
    process.env.LIFERAY_PATH + '/o/headless-admin-user/v1.0/user-groups';
  const options = functions.getAPIOptions('POST', 'en-US');

  let returnid = 0;

  try {
    const response = await axios.post(orgApiPath, postBody, options);

    returnid = response.data.id;

    debug('returned id:' + returnid);
  } catch (error) {
    console.log(error);
  }

  return returnid;
}
