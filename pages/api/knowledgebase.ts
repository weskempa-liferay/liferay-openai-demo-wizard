import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

import schema, { z } from "../../schemas/zod";
import { axiosInstance } from "../../services/liferay";
import functions from "../../utils/functions";
import { logger } from "../../utils/logger";

const debug = logger("KnowledgeBaseAction");

export default async function KnowledgeBaseAction(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const start = new Date().getTime();

  const openai = new OpenAI({
    apiKey: req.body.config.openAIKey,
  });

  const knowledgeBasePayload = req.body as z.infer<typeof schema.knowledgeBase>;

  //TODO Liferay's API does not yet support Suggestions. Once that is available development can continue.

  const knowledgeBaseSchema = {
    properties: {
      categories: {
        description:
          "An array of " +
          req.body.kbFolderNumber +
          " or more knowledge base categories related to the given topic",
        items: {
          properties: {
            articles: {
              description:
                "An array of " +
                req.body.kbArticleNumber +
                " knowledge base articles within the category",
              items: {
                properties: {
                  articleBody: {
                    description:
                      "The knowledge base article. The knowledge base article should be " +
                      req.body.kbArticleLength +
                      " words or more." +
                      " Translate this into " +
                      functions.getLanguageDisplayName(req.body.kbLanguage),
                    type: "string",
                  },
                  headline: {
                    description:
                      "The headline of the knowledge base article. " +
                      " Translate this into " +
                      functions.getLanguageDisplayName(req.body.kbLanguage),
                    type: "string",
                  },
                },
                required: ["headline", "articleBody"],
                type: "object",
              },
              required: ["articles"],
              type: "array",
            },
            category: {
              description:
                "Name of the knowledge base category." +
                " Translate this into " +
                functions.getLanguageDisplayName(req.body.kbLanguage),
              type: "string",
            },
          },
          required: ["category"],
          type: "object",
        },
        required: ["categories"],
        type: "array",
      },
    },
    type: "object",
  };

  const response = await openai.chat.completions.create({
    functions: [
      { name: "get_knowledge_base_content", parameters: knowledgeBaseSchema },
    ],
    messages: [
      {
        content:
          "You are a knowledge base administrator responsible for managing the knowledge base for your company.",
        role: "system",
      },
      {
        content:
          "Create a list of knowledge base categories and articles on the subject of '" +
          req.body.kbTopic +
          "'. It is important to include " +
          req.body.kbFolderNumber +
          " knowledge base categories and " +
          req.body.kbArticleNumber +
          " knowledge base articles in each category. " +
          "Each knowledge base article should be " +
          req.body.kbArticleLength +
          " words or more. Translate all responses into " +
          functions.getLanguageDisplayName(req.body.kbLanguage),
        role: "user",
      },
    ],
    model: req.body.config.model,
    temperature: 0.6,
  });

  const categories = JSON.parse(
    response.choices[0].message.function_call.arguments,
  ).categories;

  debug(JSON.stringify(categories));

  const axios = axiosInstance(req, res);

  for (const category of categories) {
    const kbSectionResponse = await axios.post(
      `/o/headless-delivery/v1.0/sites/${knowledgeBasePayload.siteId}/knowledge-base-folders`,
      {
        name: category.category,
        viewableBy: req.body.viewOptions,
      },
    );

    const sectionId = kbSectionResponse.data.id;

    debug("C:" + category.category + " created with id " + sectionId);

    for (const article of category.articles) {
      const kbThreadResponse = await axios.post(
        `/o/headless-delivery/v1.0/knowledge-base-folders/${sectionId}/knowledge-base-articles`,
        {
          articleBody: article.articleBody,
          title: article.headline,
          viewableBy: knowledgeBasePayload.viewOptions,
        },
      );

      debug(
        "T:" +
          article.headline +
          " created with id " +
          kbThreadResponse.data.id,
      );
    }
  }

  let end = new Date().getTime();
  res.status(200).json({
    result: "Completed in " + functions.millisToMinutesAndSeconds(end - start),
  });
}

/* Liferay's Headless APIs do not allow for Suggestions yet
  let suggestions = article.suggestions;
  for(let m=0; m<suggestions.length; m++){

      let suggestionApiPath = req.body.config.serverURL + "/o/"+threadId+"/";

      if(debug) console.log(suggestionApiPath);

      let kbMessageJson = {
          "articleBody": suggestions[m].suggestion
      }

      let kbSuggestionThreadResponse = await axios.post(suggestionApiPath, kbSuggestionJson, options);
      let suggestionId = kbMessageThreadResponse.data.id;

      if(debug) console.log("M:" + suggestions[m].suggestion + " created with id " + suggestionId);
  }
  */
