import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

import { axiosInstance } from "../../services/liferay";
import functions from "../../utils/functions";
import { logger } from "../../utils/logger";

const debug = logger("MessageBoardAction");

export default async function MessageBoardAction(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  let start = new Date().getTime();

  const openai = new OpenAI({
    apiKey: req.body.config.openAIKey,
  });

  const messageBoardSchema = {
    properties: {
      categories: {
        description:
          "An array of " +
          req.body.mbSectionNumber +
          " or more message board categories related to the given topic",
        items: {
          properties: {
            category: {
              description:
                "Name of the message board category translated into " +
                functions.getLanguageDisplayName(req.body.mbLanguage),
              type: "string",
            },
            threads: {
              description:
                "An array of " +
                req.body.mbThreadNumber +
                " message board threads within the category translated into " +
                functions.getLanguageDisplayName(req.body.mbLanguage),
              items: {
                properties: {
                  articleBody: {
                    description:
                      "The full message as seen in the message board thread body. Use " +
                      req.body.mbThreadLength +
                      " words or more. Translated the response into " +
                      functions.getLanguageDisplayName(req.body.mbLanguage),
                    type: "string",
                  },
                  headline: {
                    description:
                      "The title of the message board thread. Translated this response into " +
                      functions.getLanguageDisplayName(req.body.mbLanguage),
                    type: "string",
                  },
                  messages: {
                    description:
                      "An array of " +
                      req.body.mbMessageNumber +
                      " message board messages within the category. Translated this response into " +
                      functions.getLanguageDisplayName(req.body.mbLanguage),
                    items: {
                      properties: {
                        message: {
                          description:
                            "The user message that relates to the message board threads. Translated this response into " +
                            functions.getLanguageDisplayName(
                              req.body.mbLanguage,
                            ),
                          type: "string",
                        },
                      },
                      type: "object",
                    },
                    required: ["messages"],
                    type: "array",
                  },
                },
                type: "object",
              },
              required: ["headline", "articleBody", "threads"],
              type: "array",
            },
          },
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
      { name: "get_message_board_content", parameters: messageBoardSchema },
    ],
    messages: [
      {
        content:
          "You are a message board administrator responsible for managing the message board for your company.",
        role: "system",
      },
      {
        content:
          "Create a list of message board categories, threads, and messages on the subject of '" +
          req.body.mbTopic +
          "'. It is important to include " +
          req.body.mbSectionNumber +
          " or more message board categories, " +
          req.body.mbThreadNumber +
          " message board threads in each category, and " +
          req.body.mbMessageNumber +
          " message board threads in each thread. " +
          "Each message board thread should be " +
          req.body.mbThreadLength +
          " words or more. Translate all responses into " +
          functions.getLanguageDisplayName(req.body.mbLanguage),
        role: "user",
      },
    ],
    model: req.body.config.model,
    temperature: 0.6,
  });

  const axios = axiosInstance(req, res);

  const categories = JSON.parse(
    response.choices[0].message.function_call.arguments,
  ).categories;

  debug(JSON.stringify(categories));

  for (const category of categories) {
    const mbSectionResponse = await axios.post(
      `/o/headless-delivery/v1.0/sites/${req.body.siteId}/message-board-sections`,
      {
        title: category.category,
        viewableBy: req.body.viewOptions,
      },
    );

    const sectionId = mbSectionResponse.data.id;

    debug("C:" + category.category + " created with id " + sectionId);

    for (const thread of category.threads) {
      const mbThreadResponse = await axios.post(
        `/o/headless-delivery/v1.0/message-board-sections/${sectionId}/message-board-threads`,
        {
          articleBody: thread.articleBody,
          headline: thread.headline,
          viewableBy: req.body.viewOptions,
        },
      );

      const threadId = mbThreadResponse.data.id;

      debug("T:" + thread.headline + " created with id " + threadId);

      let messages = thread.messages;

      for (const message of messages) {
        const mbMessageThreadResponse = await axios.post(
          `/o/headless-delivery/v1.0/message-board-threads/${threadId}/message-board-messages`,
          {
            articleBody: message.message,
            viewableBy: req.body.viewOptions,
          },
        );

        const messageId = mbMessageThreadResponse.data.id;

        debug("M:" + messages[m].message + " created with id " + messageId);
      }
    }
  }

  let end = new Date().getTime();

  res.status(200).json({
    result: "Completed in " + functions.millisToMinutesAndSeconds(end - start),
  });
}
