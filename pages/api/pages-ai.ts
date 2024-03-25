import { AxiosInstance } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

import { axiosInstance } from "../../services/liferay";
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

  debug(req.body);

  const siteMapSchema = {
    properties: {
      sitepages: {
        description: `An array of ${req.body.pageNumber} site pages`,
        items: {
          properties: {
            childpages: {
              description: `An array of ${req.body.childPageNumber} pages that are children the parent page`,
              items: {
                properties: {
                  childPageComponentList: {
                    description:
                      "A comma-delimited list of expected page components, not including not include Header, Footer, or Sidebar. Provide more than 1 if possible.",
                    type: "string",
                  },
                  childPageContentDescription: {
                    description:
                      "A description of the types of content and features that would be available on this page.",
                    type: "string",
                  },
                  childPageName: {
                    description: "A creative name of the business",
                    type: "string",
                  },
                  /*
                  "unit": {
                    "type": "string",
                    "enum": ["login", "form", "product list"],
                    "description": "Types of page components"
                  },
                  */
                },
                required: ["name", "contentDescription", "pageComponentList"],
                type: "object",
              },
              required: ["childpages"],
              type: "array",
            },
            contentDescription: {
              description:
                "A description of the types of content and features that would be available on this page.",
              type: "string",
            },
            name: {
              description: "The name of the page.",
              type: "string",
            },
            pageComponentList: {
              description:
                "A comma-delimited list of expected page components, not including not include Header, Footer, or Sidebar. Provide more than 1 if possible.",
              type: "string",
            },
          },
          required: ["name", "contentDescription", "pageComponentList"],
          type: "object",
        },
        required: ["sitepages"],
        type: "array",
      },
    },
    type: "object",
  };

  const response = await openai.chat.completions.create({
    functions: [{ name: "get_sitemap", parameters: siteMapSchema }],
    messages: [
      {
        content:
          "You are an site manager responsible for planning the website navigation for your company's site.",
        role: "system",
      },
      {
        content:
          "Create a site map of the expected website pages and related child pages with a company's " +
          req.body.pageTopic +
          " website site. ",
        role: "user",
      },
    ],

    // TODO - gpt-3.5 models provide inconsistant result. Need to explore options.
    // Forcing newer model
    // model: req.body.config.model,

    model: "gpt-4",
    temperature: 0.8,
  });

  debug(JSON.parse(response.choices[0].message.function_call.arguments));

  let pages = JSON.parse(
    response.choices[0].message.function_call.arguments,
  ).sitepages;

  debug(JSON.stringify(pages));

  if (!pages) {
    return res.status(200).json({
      result: "Error: No results returned.",
    });
  }

  const axios = axiosInstance(req, res);

  for (const page of pages) {
    const pagePath = await createSitePage(
      axios,
      req.body.siteId,
      page.name,
      page.contentDescription,
      page.pageComponentList,
      req.body.addPageContent,
      "home",
    );

    const childPages = page.childpages || [];

    for (const childPage of childPages) {
      await createSitePage(
        axios,
        req.body.siteId,
        childPage.childPageName,
        childPage.childPageContentDescription,
        childPage.childPageComponentList,
        req.body.addPageContent,
        pagePath,
      );
    }
  }

  let end = new Date().getTime();

  res.status(200).json({
    result: "Completed in " + functions.millisToMinutesAndSeconds(end - start),
  });
}

async function createSitePage(
  axios: AxiosInstance,
  groupId,
  name,
  contentDescription,
  pageComponentList,
  addPageContent,
  parentPath,
) {
  debug("Creating " + name + " with parent " + parentPath);

  try {
    const response = await axios.post(
      `/o/headless-delivery/v1.0/sites/${groupId}/site-pages`,
      getPageSchema(
        name,
        contentDescription,
        pageComponentList,
        addPageContent,
        parentPath,
      ),
    );

    const returnPath = response.data.friendlyUrlPath;

    debug("returned friendlyUrlPath: " + returnPath);

    return returnPath;
  } catch (error) {
    console.log(error);
  }

  return "";
}

function getPageSchema(
  name,
  contentDescription,
  pageComponentList,
  addPageContent,
  parentPath,
) {
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
      {
        actionKeys: ["VIEW"],
        roleKey: "Guest",
      },
    ],
    parentSitePage: {
      friendlyUrlPath: parentPath,
    },
    title: name,
    title_i18n: {
      en_US: name,
    },
    viewableBy: "Anyone",
  };

  pageSchema.pageDefinition.pageElement.pageElements[0].pageElements.push(
    getParagraph(contentDescription),
  );

  if (addPageContent) {
    let contentArray = pageComponentList.split(",");

    for (let i = 0; i < contentArray.length; i++) {
      let type = contentArray[i].trim();
      if (
        type !== "Header" &&
        type !== "Footer" &&
        type !== "Sidebar" &&
        type !== "Search bar" &&
        type !== "Filters"
      )
        pageSchema.pageDefinition.pageElement.pageElements[0].pageElements.push(
          getContent(type),
        );
    }
  }

  return pageSchema;
}

function getContent(contentType) {
  let appliedContent = {};
  let seed = contentType.toLowerCase();

  if (seed.indexOf("blog") > -1) {
    //TODO Option to call Blog API
    appliedContent = getBlog();
  } else if (seed.indexOf("faq") > -1) {
    //TODO Option to call FAQ API
    appliedContent = getCollectionDisplay();
  } else if (seed.indexOf("order history") > -1) {
    appliedContent = getOrderHistory();
  } else if (seed.indexOf("form") > -1) {
    //TODO Explore Object Schema Creation using AI Prompts
    appliedContent = getFormContainer();
  } else if (seed.indexOf("login") > -1 || seed.indexOf("sign in") > -1) {
    appliedContent = getLogin();
  } else if (seed.indexOf("calendar") > -1) {
    appliedContent = getCalendar();
  } else {
    appliedContent = getParagraph(contentType);
  }

  return appliedContent;
}

function getCalendar() {
  return {
    definition: {
      widgetInstance: {
        widgetConfig: {},
        widgetName: "com_liferay_calendar_web_portlet_CalendarPortlet",
      },
    },
    type: "Widget",
  };
}

function getLogin() {
  return {
    definition: {
      widgetInstance: {
        widgetConfig: {},
        widgetName: "com_liferay_login_web_portlet_LoginPortlet",
      },
    },
    type: "Widget",
  };
}

function getFormContainer() {
  return {
    definition: {
      formConfig: {
        formReference: {
          contextSource: "DisplayPageItem",
        },
      },
      indexed: true,
      layout: {},
    },
    type: "Form",
  };
}

function getOrderHistory() {
  return {
    definition: {
      widgetInstance: {
        widgetConfig: {},
        widgetName:
          "com_liferay_commerce_order_content_web_internal_portlet_CommerceOrderContentPortlet",
      },
    },
    type: "Widget",
  };
}

function getCollectionDisplay() {
  return {
    definition: {
      collectionViewports: [
        {
          collectionViewportDefinition: {
            numberOfColumns: 1,
          },
          id: "landscapeMobile",
        },
        {
          collectionViewportDefinition: {},
          id: "portraitMobile",
        },
        {
          collectionViewportDefinition: {},
          id: "tablet",
        },
      ],
      displayAllItems: false,
      displayAllPages: true,
      numberOfColumns: 1,
      numberOfItems: 5,
      numberOfItemsPerPage: 20,
      numberOfPages: 5,
      paginationType: "Numeric",
      showAllItems: false,
    },
    pageElements: [
      {
        definition: {
          collectionItemConfig: {},
        },
        type: "CollectionItem",
      },
    ],
    type: "Collection",
  };
}

function getBlog() {
  return {
    definition: {
      widgetInstance: {
        widgetConfig: {},
        widgetName: "com_liferay_blogs_web_portlet_BlogsPortlet",
      },
    },
    type: "Widget",
  };
}

function getParagraph(content) {
  return {
    definition: {
      fragment: {
        key: "BASIC_COMPONENT-paragraph",
      },
      fragmentConfig: {},
      fragmentFields: [
        {
          id: "element-text",
          value: {
            fragmentLink: {},
            text: {
              value_i18n: {
                en_US: content,
              },
            },
          },
        },
      ],
      indexed: true,
    },
    type: "Fragment",
  };
}
