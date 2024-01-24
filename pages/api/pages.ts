import axios from 'axios';
import OpenAI from 'openai';

import functions from '../utils/functions';
import { logger } from '../utils/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const debug = logger('Pages Action');

export default async function SitesAction(req, res) {
  const start = new Date().getTime();

  debug(req.body);

  const pagesSchema = {
    properties: {
      pages: {
        description: 'An array of ' +
        req.body.childPageNumber +
        ' pages',
        items: {
          properties: {
            childpages: {
              description:
                'An array of ' +
                req.body.childPageNumber +
                ' pages that are children the parent page',
              items: {
                properties: {
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
              description: 'A name of the page.',
              type: 'string',
            },
            description: {
              description: 'A sentence that can be used to describe the page.',
              type: 'string',
            },
          },
          required: ['name', 'description', 'childpages'],
          type: 'object',
        },
        required: ['pages'],
        type: 'array',
      },
    },
    type: 'object',
  };

  const response = await openai.chat.completions.create({
    functions: [{ name: 'get_pages', parameters: pagesSchema }],
    messages: [
      {
        content:
          'You are an page manager responsible for listing the pages for your company.',
        role: 'system',
      },
      {
        content:
          'Create a list of expected pages and related child pages with a company\'s ' +
          req.body.pageTopic + ' site. ' +
          'Do not include double quotes in the response.',
        role: 'user',
      },
    ],
    model: 'gpt-3.5-turbo',
    temperature: 0.6,
  });

  let pages = JSON.parse(
    response.choices[0].message.function_call.arguments
  ).pages;
  debug(JSON.stringify(pages));


  for (let i = 0; i < pages.length; i++) {
    debug(pages[i]);

    const pagePath = await createSitePage(
      req.body.siteId, pages[i], "home");

    const childpages = pages[i].childpages;
    if(childpages){
      for (let j = 0; j < childpages.length; j++) {
        let childPageId = await createSitePage(req.body.siteId, childpages[j], pagePath);
      }
    }

  }

  let end = new Date().getTime();

  res.status(200).json({
    result: 'Completed in ' + functions.millisToMinutesAndSeconds(end - start),
  });
}

async function createSitePage(groupId, page, parentPath) {
  debug('Creating ' + page.name + ' with parent ' + parentPath);
  
  const postBody = getPageSchema(page.name, parentPath);

  const orgApiPath =
    process.env.LIFERAY_PATH + '/o/headless-delivery/v1.0/sites/'+groupId+'/site-pages';
  const options = functions.getAPIOptions('POST', 'en-US');
  let returnPath = "";

  try {

    const response = await axios.post(orgApiPath, postBody, options);

    returnPath = response.data.friendlyUrlPath;

    debug('returned friendlyUrlPath: ' + returnPath);

  } catch (error) {
    console.log(error);
  }

  return returnPath;
}

function preparePath(path){
  let tempPath = process.env.LIFERAY_PATH.split("//");
  return tempPath[0] + "//" +
    process.env.LIFERAY_ADMIN_EMAIL_ADDRESS + ":" +
    process.env.LIFERAY_ADMIN_PASSWORD + "@" + tempPath[1];

};

function getPageSchema(name, parentPath){

  return {
    "pageDefinition": {
      "pageElement": {
        "pageElements": [
          {
            "definition": {
              "indexed": true,
              "layout": {
                "widthType": "Fixed"
              }
            },
            "pageElements": [
              
            ],
            "type": "Section"
          }
        ],
        "type": "Root"
      },
      "settings": {
        "colorSchemeName": "01",
        "themeName": "Classic"
      },
      "version": 1.1
    },
    "pagePermissions": [
      {
        "actionKeys": [
          "UPDATE_DISCUSSION",
          "PERMISSIONS",
          "UPDATE_LAYOUT_ADVANCED_OPTIONS",
          "UPDATE_LAYOUT_CONTENT",
          "CUSTOMIZE",
          "LAYOUT_RULE_BUILDER",
          "ADD_LAYOUT",
          "VIEW",
          "DELETE",
          "UPDATE_LAYOUT_BASIC",
          "DELETE_DISCUSSION",
          "CONFIGURE_PORTLETS",
          "UPDATE",
          "UPDATE_LAYOUT_LIMITED",
          "ADD_DISCUSSION"
        ],
        "roleKey": "Owner"
      },
      {
        "actionKeys": [
          "CUSTOMIZE",
          "VIEW",
          "ADD_DISCUSSION"
        ],
        "roleKey": "Site Member"
      },
      {
        "actionKeys": [
          "VIEW"
        ],
        "roleKey": "Guest"
      }
    ],
    "parentSitePage": {
      "friendlyUrlPath": parentPath
    },
    "title": name,
    "title_i18n": {
      "en_US": name
    },  
    "viewableBy": "Anyone"
  };
}