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

  const siteMapSchema = {
    properties: {
      sitepages: {
        description: 'An array of ' +
        req.body.pageNumber +
        ' site pages',
        items: {
          properties: {
            name: {
              description: 'The name of the page.',
              type: 'string',
            },
            contentDescription: {
              description: 'A description of the types of content and features that would be available on this page.',
              type: 'string',
            },
            pageComponentList: {
              description: 'A comma-delimited list of page expected components. Provide more than 1 if possible.',
              type: 'string',
            },
            childpages: {
              description:
                'An array of ' +
                req.body.childPageNumber +
                ' pages that are children the parent page',
              items: {
                properties: {
                  childPageName: {
                    description: 'A creative name of the business',
                    type: 'string',
                  },
                  childPageContentDescription: {
                    description: 'A description of the types of content and features that would be available on this page.',
                    type: 'string',
                  },
                  childPageComponentList: {
                    description: 'A comma-delimited list of expected page components. Provide more than 1 if possible.',
                    type: 'string',
                  }
                },
                required: ['name', 'contentDescription',"pageComponentList"],
                type: 'object',
              },
              required: ['childpages'],
              type: 'array',
            }
          },
          required: ['name', 'contentDescription',"pageComponentList"],
          type: 'object',
        },
        required: ['sitepages'],
        type: 'array',
      },
    },
    type: 'object',
  };

  const response = await openai.chat.completions.create({
    functions: [{ name: 'get_sitemap', parameters: siteMapSchema }],
    messages: [
      {
        content:
          'You are an site manager responsible for planning the website navigation for your company\'s site.',
        role: 'system',
      },
      {
        content:
          'Create a site map of the expected website pages and related child pages with a company\'s ' +
          req.body.pageTopic + ' website site. ',
        role: 'user',
      },
    ],
    // TODO - Some models provide inconsistant result here with gpt-3.5-turbo-u1106. Need to review
    // Forcing newer model
    // model: req.body.config.model,
    model: "gpt-4",
    temperature: 0.8,
  });
  
  debug( JSON.parse(
    response.choices[0].message.function_call.arguments
  ) );

  let pages = JSON.parse(
    response.choices[0].message.function_call.arguments
  ).sitepages;

  debug(JSON.stringify(pages));

  if(pages){
    for (let i = 0; i < pages.length; i++) {
      debug(pages[i]);
  
      const pagePath = await createSitePage(
        req.body.siteId,
        pages[i].name,
        pages[i].contentDescription,
        pages[i].pageComponentList,
        "home");
  
      const childpages = pages[i].childpages;
      if(childpages){
        for (let j = 0; j < childpages.length; j++) {
          let childPageId = await createSitePage(
            req.body.siteId,
            childpages[j].childPageName,
            childpages[j].childPageContentDescription,
            childpages[j].childPageComponentList,
            pagePath);
        }
      }
  
    }
  } else {
    res.status(200).json({
      result: 'Error: No results returned.'
    });

    return;
  }

  let end = new Date().getTime();

  res.status(200).json({
    result: 'Completed in ' + functions.millisToMinutesAndSeconds(end - start),
  });
}

async function createSitePage(groupId, name, contentDescription, pageComponentList, parentPath) {
  debug('Creating ' + name + ' with parent ' + parentPath);
  
  const postBody = getPageSchema(name, contentDescription, pageComponentList, parentPath);

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

function getPageSchema(name, contentDescription, pageComponentList, parentPath){

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
              {
                "definition": {
                  "fragment": {
                    "key": "BASIC_COMPONENT-paragraph"
                  },
                  "fragmentConfig": {},
                  "fragmentFields": [
                    {
                      "id": "element-text",
                      "value": {
                        "fragmentLink": {},
                        "text": {
                          "value_i18n": {
                            "en_US": contentDescription + " <br/>[" + pageComponentList + "]"
                          }
                        },
                      }
                    }
                  ],
                  "indexed": true
                },
                "type": "Fragment"
              }
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