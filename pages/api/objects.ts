import axios from 'axios';
import OpenAI from 'openai';

import functions from '../utils/functions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function Action(req, res) {
  let start = new Date().getTime();

  const debug = req.body.debugMode;
  let aiRole = req.body.aiRole;
  let aiRequest = req.body.aiRequest;
  let aiEndpoint = req.body.aiEndpoint;
  let objectFields = req.body.objectFields;

  let requiredList = [];
  for (let i = 0; i < objectFields.length; i++) {
    requiredList.push(objectFields[i].fieldName);
  }

  const objectSchema = {
    properties: {
      resultlist: {
        description: aiRequest,
        items: {
          properties: objectFields,
          required: requiredList,
          type: 'object',
        },
        required: ['list'],
        type: 'array',
      },
    },
    type: 'object',
  };

  if (debug) console.log(objectSchema);

  const response = await openai.chat.completions.create({
    functions: [{ name: 'get_objects', parameters: objectSchema }],
    messages: [
      { content: aiRole, role: 'system' },
      { content: aiRequest, role: 'user' },
    ],
    model: 'gpt-3.5-turbo',
    temperature: 0.6,
  });

  let resultlist = JSON.parse(
    response.choices[0].message.function_call.arguments
  ).resultlist;
  if (debug) console.log(JSON.stringify(resultlist));

  let objectApiPath = process.env.LIFERAY_PATH + aiEndpoint;

  const options = functions.getAPIOptions('POST', 'en-US');

  try {
    const response = await axios.post(objectApiPath, resultlist, options);

    if (debug) console.log(response.data);
  } catch (error) {
    console.log(error);
  }

  let end = new Date().getTime();

  res.status(200).json({
    result: 'Completed in ' + functions.millisToMinutesAndSeconds(end - start),
  });
}
