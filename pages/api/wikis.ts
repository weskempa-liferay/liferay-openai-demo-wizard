import axios from 'axios';
import OpenAI from 'openai';

import functions from '../../utils/functions';
import { logger } from '../../utils/logger';

const debug = logger('WikiAction');

export default async function WikiAction(req, res) {
  let start = new Date().getTime();

  const openai = new OpenAI({
    apiKey: req.body.config.openAIKey,
  });

  let options = functions.getAPIOptions('POST', 'en-US', req.body.config.base64data);

  debug(req.body);

  const wikiSchema = {
    properties: {
      wikipages: {
        description:
          'An array of ' +
          req.body.wikiPageNumber +
          ' or more wiki category pages.',
        items: {
          properties: {
            childarticles: {
              description:
                'An array of ' +
                req.body.wikiChildPageNumber +
                ' wiki child articles for each category',
              items: {
                properties: {
                  articleBody: {
                    description:
                      'The wiki child article. The wiki child article should be ' +
                      req.body.wikiArticleLength +
                      ' words or more.',
                    type: 'string',
                  },
                  title: {
                    description: 'The title of the wiki childarticle.',
                    type: 'string',
                  },
                },
                required: ['title', 'articleBody'],
                type: 'object',
              },
              required: ['childarticles'],
              type: 'array',
            },
            pageBody: {
              description: 'The wiki category page article or description.',
              type: 'string',
            },
            title: {
              description: 'The title of the wiki page.',
              type: 'string',
            },
          },
          required: ['title', 'pageBody'],
          type: 'object',
        },
        required: ['wikipages'],
        type: 'array',
      },
    },
    type: 'object',
  };

  const response = await openai.chat.completions.create({
    functions: [{ name: 'get_wiki_content', parameters: wikiSchema }],
    messages: [
      {
        content:
          'You are a wiki administrator responsible for managing the wiki for your company.',
        role: 'system',
      },
      {
        content:
          "Create a list of wiki category pages and child articles on the subject of '" +
          req.body.wikiTopic +
          "'. It is important to include " +
          req.body.wikiPageNumber +
          ' wiki category pages and ' +
          req.body.wikiChildPageNumber +
          ' wiki child articles for each page. ' +
          'Each wiki article should be ' +
          req.body.wikiArticleLength +
          ' words or more.',
        role: 'user',
      },
    ],
    model: req.body.config.model,
    temperature: 0.6,
  });

  const wikiPages = JSON.parse(
    response.choices[0].message.function_call.arguments
  ).wikipages;

  debug(JSON.stringify(wikiPages));

  let nodeId = await createWikiNode(
    req, 
    req.body.siteId,
    req.body.wikiNodeName,
    req.body.viewOptions
  );

  for (let i = 0; wikiPages.length > i; i++) {
    let frontPageId = await createWikiPage(
      req, 
      nodeId,
      wikiPages[i].title,
      wikiPages[i].pageBody,
      req.body.viewOptions
    );

    let childPages = wikiPages[i].childarticles;
    if (childPages) {
      for (let ii = 0; childPages.length > ii; ii++) {
        await createChildWikiPage(
          req, 
          frontPageId,
          nodeId,
          childPages[ii].title,
          childPages[ii].articleBody,
          req.body.viewOptions
        );
      }
    }
  }

  let end = new Date().getTime();
  res.status(200).json({
    result: 'Completed in ' + functions.millisToMinutesAndSeconds(end - start),
  });
}

async function createWikiNode(req, groupId, name, viewableBy) {
  debug('Creating Wiki Node ' + name + ' with groupId ' + groupId);

  const postBody = {
    name: name,
    viewableBy: viewableBy,
  };

  const apiPath =
    req.body.config.serverURL +
    '/o/headless-delivery/v1.0/sites/' +
    groupId +
    '/wiki-nodes';
  const options = functions.getAPIOptions('POST', 'en-US', req.body.config.base64data);
  let returnId = 0;

  try {
    const response = await axios.post(apiPath, postBody, options);
    returnId = response.data.id;
    debug('Returned NodeId: ' + returnId);
  } catch (error) {
    console.log(error);
  }

  return returnId;
}

async function createWikiPage(req, nodeId, name, body, viewableBy) {
  debug('Creating page for Wiki NodeId ' + nodeId + ' with name: ' + name);

  const postBody = {
    content: '<p>' + body + '</p>',
    encodingFormat: 'text/html',
    headline: name,
    viewableBy: viewableBy,
  };

  const apiPath =
    req.body.config.serverURL +
    '/o/headless-delivery/v1.0/wiki-nodes/' +
    nodeId +
    '/wiki-pages';
  const options = functions.getAPIOptions('POST', 'en-US', req.body.config.base64data);
  let returnId = 0;

  try {
    const response = await axios.post(apiPath, postBody, options);
    returnId = response.data.id;
    debug('Returned PageId: ' + returnId);
  } catch (error) {
    console.log(error);
  }

  return returnId;
}

async function createChildWikiPage(
  req, 
  parentPageId,
  nodeId,
  name,
  body,
  viewableBy
) {
  debug(
    'Creating child page for Wiki parentPageId ' +
      parentPageId +
      ' with name: ' +
      name
  );

  const postBody = {
    content: '<p>' + body + '</p>',
    encodingFormat: 'text/html',
    headline: name,
    parentWikiPageId: parentPageId,
    viewableBy: viewableBy,
    wikiNodeId: nodeId,
  };

  const apiPath =
    req.body.config.serverURL +
    '/o/headless-delivery/v1.0/wiki-pages/' +
    parentPageId +
    '/wiki-pages';
  const options = functions.getAPIOptions('POST', 'en-US', req.body.config.base64data);
  let returnId = 0;

  try {
    const response = await axios.post(apiPath, postBody, options);
    returnId = response.data.id;
    debug('Returned WikiPageId: ' + returnId);
  } catch (error) {
    console.log(error);
  }

  return returnId;
}
