import { AxiosInstance } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

import schema, { z } from "../../schemas/zod";
import { axiosInstance } from "../../services/liferay";
import functions from "../../utils/functions";
import { logger } from "../../utils/logger";

const debug = logger("WikiAction");

type WikiPayload = z.infer<typeof schema.wiki>;

export default async function WikiAction(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const start = new Date().getTime();

  const wikiPayload = req.body as WikiPayload;

  const openai = new OpenAI({
    apiKey: req.body.config.openAIKey,
  });

  const wikiSchema = {
    properties: {
      wikipages: {
        description:
          "An array of " +
          wikiPayload.wikiPageNumber +
          " or more wiki category pages.",
        items: {
          properties: {
            childarticles: {
              description:
                "An array of " +
                wikiPayload.wikiChildPageNumber +
                " wiki child articles for each category",
              items: {
                properties: {
                  articleBody: {
                    description:
                      "The wiki child article. The wiki child article should be " +
                      wikiPayload.wikiArticleLength +
                      " words or more.",
                    type: "string",
                  },
                  title: {
                    description: "The title of the wiki childarticle.",
                    type: "string",
                  },
                },
                required: ["title", "articleBody"],
                type: "object",
              },
              required: ["childarticles"],
              type: "array",
            },
            pageBody: {
              description: "The wiki category page article or description.",
              type: "string",
            },
            title: {
              description: "The title of the wiki page.",
              type: "string",
            },
          },
          required: ["title", "pageBody"],
          type: "object",
        },
        required: ["wikipages"],
        type: "array",
      },
    },
    type: "object",
  };

  const response = await openai.chat.completions.create({
    functions: [{ name: "get_wiki_content", parameters: wikiSchema }],
    messages: [
      {
        content:
          "You are a wiki administrator responsible for managing the wiki for your company.",
        role: "system",
      },
      {
        content:
          "Create a list of wiki category pages and child articles on the subject of '" +
          wikiPayload.wikiTopic +
          "'. It is important to include " +
          wikiPayload.wikiPageNumber +
          " wiki category pages and " +
          wikiPayload.wikiChildPageNumber +
          " wiki child articles for each page. " +
          "Each wiki article should be " +
          wikiPayload.wikiArticleLength +
          " words or more.",
        role: "user",
      },
    ],
    model: req.body.config.model,
    temperature: 0.6,
  });

  const wikiPages = JSON.parse(
    response.choices[0].message.function_call.arguments,
  ).wikipages;

  debug(JSON.stringify(wikiPages));

  const axios = axiosInstance(req, res);

  const nodeId = await createWikiNode(axios, wikiPayload);

  for (const wikiPage of wikiPages) {
    const frontPageId = await createWikiPage(
      axios,
      nodeId,
      wikiPage,
      wikiPayload,
    );

    const childPages = wikiPage.childarticles;

    if (childPages) {
      for (const childPage of childPages) {
        await createChildWikiPage(
          axios,
          frontPageId,
          nodeId,
          childPage,
          wikiPayload,
        );
      }
    }
  }

  const end = new Date().getTime();

  res.status(200).json({
    result: "Completed in " + functions.millisToMinutesAndSeconds(end - start),
  });
}

async function createWikiNode(axios: AxiosInstance, wikiPayload: WikiPayload) {
  debug(
    `Creating Wiki Node ${wikiPayload.wikiNodeName} with siteId ${wikiPayload.siteId}`,
  );

  try {
    const response = await axios.post(
      `/o/headless-delivery/v1.0/sites/${wikiPayload.siteId}/wiki-nodes`,
      {
        name: wikiPayload.wikiNodeName,
        viewableBy: wikiPayload.viewOptions,
      },
    );

    return response.data.id;
  } catch (error) {
    console.log(error);
  }

  return 0;
}

async function createWikiPage(
  axios: AxiosInstance,
  nodeId: string,
  wikiPage,
  wikiPayload: WikiPayload,
) {
  debug(`Creating page for Wiki NodeId ${nodeId} with name: ${wikiPage.name}`);

  try {
    const response = await axios.post(
      `/o/headless-delivery/v1.0/wiki-nodes/${nodeId}/wiki-pages`,
      {
        content: `<p>${wikiPage.body}</p>`,
        encodingFormat: "text/html",
        headline: wikiPage.name,
        viewableBy: wikiPayload.viewOptions,
      },
    );

    return response.data.id;
  } catch (error) {
    console.log(error);
  }

  return 0;
}

async function createChildWikiPage(
  axios: AxiosInstance,
  parentPageId: string,
  nodeId: string,
  childPage,
  wikiPayload: WikiPayload,
) {
  debug(
    `Creating child page for Wiki parentPageId ${parentPageId} with name: ${childPage.title}`,
  );

  try {
    const response = await axios.post(
      "/o/headless-delivery/v1.0/wiki-pages/" + parentPageId + "/wiki-pages",
      {
        content: `<p>${childPage.articleBody}</p>`,
        encodingFormat: "text/html",
        headline: childPage.title,
        parentWikiPageId: parentPageId,
        viewableBy: wikiPayload.viewOptions,
        wikiNodeId: nodeId,
      },
    );
    return response.data.id;
  } catch (error) {
    console.log(error);
  }

  return 0;
}
