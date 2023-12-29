import axios from 'axios';
import OpenAI from 'openai';

import functions from '../utils/functions';
import { logger } from '../utils/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const debug = logger('OrganizationsAction');

export default async function OrganizationsAction(req, res) {
  const start = new Date().getTime();

  debug(req.body);

  const organizationsSchema = {
    properties: {
      organizations: {
        description: 'An array of business organization company names',
        items: {
          properties: {
            childbusinesses: {
              description:
                'An array of ' +
                req.body.childOrganizationtNumber +
                ' businesses within the organization',
              items: {
                properties: {
                  departments: {
                    description:
                      'An array of ' +
                      req.body.departmentNumber +
                      ' departments within the business',
                    items: {
                      properties: {
                        name: {
                          description: 'Name of the department',
                          type: 'string',
                        },
                      },
                      type: 'object',
                    },
                    required: ['name', 'departments'],
                    type: 'array',
                  },
                  name: {
                    description: 'A creative name of the business',
                    type: 'string',
                  },
                },
                type: 'object',
              },
              required: ['name'],
              type: 'array',
            },
            name: {
              description: 'A creative name of the business organization.',
              type: 'string',
            },
          },
          required: ['name', 'childbusinesses'],
          type: 'object',
        },
        required: ['organizations'],
        type: 'array',
      },
    },
    type: 'object',
  };

  const response = await openai.chat.completions.create({
    functions: [{ name: 'get_organizations', parameters: organizationsSchema }],
    messages: [
      {
        content:
          'You are an organization manager responsible for listing the business organizations for your company.',
        role: 'system',
      },
      {
        content:
          'Create a list of expected organizations, child businesses, and departments for a company that provides ' +
          req.body.organizationTopic +
          '. ' +
          'Do not include double quotes in the response.',
        role: 'user',
      },
    ],
    model: 'gpt-3.5-turbo',
    temperature: 0.6,
  });

  let organizations = JSON.parse(
    response.choices[0].message.function_call.arguments
  ).organizations;
  debug(JSON.stringify(organizations));

  for (let i = 0; i < organizations.length; i++) {
    debug(organizations[i]);

    const orgId = await createOrganization(organizations[i], false);
    const childbusinesses = organizations[i].childbusinesses;

    debug(orgId + ' has ' + childbusinesses.length + ' child businesses.');

    for (let j = 0; j < childbusinesses.length; j++) {
      let childOrgId = await createOrganization(childbusinesses[j], orgId);
      let departments = childbusinesses[j].departments;

      debug(
        childOrgId + ' has ' + departments.length + ' related departments.'
      );

      for (let k = 0; k < departments.length; k++) {
        createOrganization(departments[k], childOrgId);
      }
    }
  }

  let end = new Date().getTime();

  res.status(200).json({
    result: 'Completed in ' + functions.millisToMinutesAndSeconds(end - start),
  });
}

async function createOrganization(organization, parentOrgId) {
  debug('Creating ' + organization.name + ' with parent ' + parentOrgId);

  const postBody = {
    name: organization.name,
    ...(parentOrgId > 0 && {
      parentOrganization: {
        id: parentOrgId,
      },
    }),
  };

  const orgApiPath =
    process.env.LIFERAY_PATH + '/o/headless-admin-user/v1.0/organizations';
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
