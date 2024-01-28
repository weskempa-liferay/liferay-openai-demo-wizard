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

  //debug(req.body.fileoutput);

  let pages = JSON.parse(req.body.fileoutput).pages;

  //debug(pages);
  //debug(pages.length);

  for (let i = 0; i < pages.length; i++) {
    debug(pages[i]);
    await createSitePage(
        req.body.siteId, pages[i], "home");

  }

  let end = new Date().getTime();

  res.status(200).json({
    result: 'Completed in ' + functions.millisToMinutesAndSeconds(end - start),
  });
}

async function createSitePage(groupId, page, parentPath) {
  debug('Creating ' + page.name + ' with parent ' + parentPath);
  
  const postBody = getPageSchema(page.name, parentPath, "Anyone");

  const orgApiPath =
    process.env.LIFERAY_PATH + '/o/headless-delivery/v1.0/sites/'+groupId+'/site-pages';
  const options = functions.getAPIOptions('POST', 'en-US');
  let returnPath = "";

  try {

    const response = await axios.post(orgApiPath, postBody, options);

    returnPath = response.data.friendlyUrlPath;

    debug('returned friendlyUrlPath: ' + returnPath);

    if(page.pages && page.pages.length>0){

        for (let i = 0; i < page.pages.length; i++) {
            createSitePage(groupId, page.pages[i], returnPath);
        }
    }

  } catch (error) {
    console.log(error);
  }

  return returnPath;
}

function getPageSchema(name, parentPath, viewableBy){

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
    "viewableBy": viewableBy
  };
}