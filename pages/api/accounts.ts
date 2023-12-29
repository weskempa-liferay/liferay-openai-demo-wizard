import OpenAI from 'openai';

import functions from '../utils/functions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function Action(req, res) {
  let start = new Date().getTime();

  const debug = req.body.debugMode;

  const accountSchema = {
    properties: {
      accounts: {
        description:
          'An array of ' + req.body.accountNumber + ' business accounts',
        items: {
          properties: {
            name: {
              description: 'Name of the business.',
              type: 'string',
            },
          },
          required: ['name'],
          type: 'object',
        },
        required: ['accounts'],
        type: 'array',
      },
    },
    type: 'object',
  };

  const response = await openai.chat.completions.create({
    functions: [{ name: 'get_accounts', parameters: accountSchema }],
    messages: [
      {
        content:
          'You are an account manager responsible for listing the active acccounts for your company.',
        role: 'system',
      },
      {
        content:
          'Create a list of active acccounts for a company that provides ' +
          req.body.accountTopic,
        role: 'user',
      },
    ],
    model: 'gpt-3.5-turbo',
    temperature: 0.6,
  });

  let accounts = JSON.parse(
    response.choices[0].message.function_call.arguments
  ).accounts;
  if (debug) console.log(JSON.stringify(accounts));

  for (let i = 0; i < accounts.length; i++) {
    if (debug) console.log(accounts[i]);

    let postBody = {
      externalReferenceCode: accounts[i].name
        .replaceAll(' ', '-')
        .toLowerCase(),
      name: accounts[i].name,
      type: 2,
    };

    import axios from 'axios';

    let faqApiPath =
      process.env.LIFERAY_PATH +
      '/o/headless-commerce-admin-account/v1.0/accounts';

    const options = functions.getAPIOptions('POST', 'en-US');

    try {
      const response = await axios.post(faqApiPath, postBody, options);

      if (debug) console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  let end = new Date().getTime();

  res.status(200).json({
    result: 'Completed in ' + functions.millisToMinutesAndSeconds(end - start),
  });
}
