import axios from 'axios';
import OpenAI from 'openai';

import functions from '../utils/functions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function Action(req, res) {
  let start = new Date().getTime();

  const debug = req.body.debugMode;

  if (debug)
    console.log(
      'childOrganizationtNumber: ' +
        req.body.childOrganizationtNumber +
        ', departmentNumber: ' +
        req.body.departmentNumber
    );

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
  if (debug) console.log(JSON.stringify(organizations));

  for (let i = 0; i < organizations.length; i++) {
    if (debug) console.log(organizations[i]);

    let orgId = await createOrganization(organizations[i], false, debug);
    let childbusinesses = organizations[i].childbusinesses;

    if (debug)
      console.log(
        orgId + ' has ' + childbusinesses.length + ' child businesses.'
      );

    for (let j = 0; j < childbusinesses.length; j++) {
      let childOrgId = await createOrganization(
        childbusinesses[j],
        orgId,
        debug
      );
      let departments = childbusinesses[j].departments;

      if (debug)
        console.log(
          childOrgId + ' has ' + departments.length + ' related departments.'
        );

      for (let k = 0; k < departments.length; k++) {
        createOrganization(departments[k], childOrgId, debug);
      }
    }
  }

  let end = new Date().getTime();

  res.status(200).json({
    result: 'Completed in ' + functions.millisToMinutesAndSeconds(end - start),
  });
}

async function createOrganization(organization, parentOrgId, debug) {
  if (debug)
    console.log(
      'Creating ' + organization.name + ' with parent ' + parentOrgId
    );

  let postBody;

  if (parentOrgId > 0) {
    postBody = {
      name: organization.name,
      parentOrganization: {
        id: parentOrgId,
      },
    };
  } else {
    postBody = {
      name: organization.name,
    };
  }

  let orgApiPath =
    process.env.LIFERAY_PATH + '/o/headless-admin-user/v1.0/organizations';

  const options = functions.getAPIOptions('POST', 'en-US');

  let returnid = 0;

  try {
    const response = await axios.post(orgApiPath, postBody, options);

    returnid = response.data.id;

    if (debug) console.log('returned id:' + returnid);
  } catch (error) {
    console.log(error);
  }

  return returnid;
}
