import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

import functions from "../../utils/functions";
import { logger } from "../../utils/logger";

const debug = logger("Pages Action");

export default async function SitesAction(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const start = new Date().getTime();

  const openai = new OpenAI({
    apiKey: req.body.config.openAIKey,
  });

  let pages = JSON.parse(req.body.fileoutput).pages;

  for (let i = 0; i < pages.length; i++) {
    debug(pages[i]);
    await createSitePage(req, req.body.siteId, pages[i], "home");
  }

  const end = new Date().getTime();

  res.status(200).json({
    result: "Completed in " + functions.millisToMinutesAndSeconds(end - start),
  });
}

async function createSitePage(req, groupId, page, parentPath) {
  let viewableBy = "viewableBy" in page ? page["viewableBy"] : "Anyone";

  debug(
    "Creating " +
      page.name +
      " with parent " +
      parentPath +
      " viewable by " +
      viewableBy,
  );

  const postBody = getPageSchema(req, page.name, parentPath, viewableBy);

  const orgApiPath =
    req.body.config.serverURL +
    "/o/headless-delivery/v1.0/sites/" +
    groupId +
    "/site-pages";
  const options = functions.getAPIOptions(
    "POST",
    "en-US",
    req.body.config.base64data,
  );
  let returnPath = "";

  try {
    const response = await axios.post(orgApiPath, postBody, options);

    returnPath = response.data.friendlyUrlPath;

    debug("returned friendlyUrlPath: " + returnPath);

    if (page.pages && page.pages.length > 0) {
      for (let i = 0; i < page.pages.length; i++) {
        createSitePage(req, groupId, page.pages[i], returnPath);
      }
    }
  } catch (error) {
    console.log(error);
  }

  return returnPath;
}

function getPageSchema(req, name, parentPath, viewableBy) {
  let pageSchema = {
    pageDefinition: {
      pageElement: {
        pageElements: [
          {
            definition: {
              indexed: true,
              layout: {
                widthType: "Fixed",
              },
            },
            pageElements: [],
            type: "Section",
          },
        ],
        type: "Root",
      },
      settings: {
        colorSchemeName: "01",
        themeName: "Classic",
      },
      version: 1.1,
    },
    pagePermissions: [
      {
        actionKeys: [
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
          "ADD_DISCUSSION",
        ],
        roleKey: "Owner",
      },
      {
        actionKeys: ["CUSTOMIZE", "VIEW", "ADD_DISCUSSION"],
        roleKey: "Site Member",
      },
    ],
    parentSitePage: {
      friendlyUrlPath: parentPath,
    },
    title: name,
    title_i18n: {
      en_US: name,
    },
    viewableBy: viewableBy,
  };

  if (viewableBy == "Anyone") {
    pageSchema.pagePermissions.push({
      actionKeys: ["VIEW"],
      roleKey: "Guest",
    });
  }

  return pageSchema;
}
