import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

import { axiosInstance } from "../../services/liferay";
import functions from "../../utils/functions";
import { logger } from "../../utils/logger";

const debug = logger("FaqsAction");

export default async function FaqsAction(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const start = new Date().getTime();

  const openai = new OpenAI({
    apiKey: req.body.config.openAIKey,
  });

  const storedProperties = {
    answer: {
      description:
        "Answer to the frequently asked question. Answers over 30 words are preferred.",
      type: "string",
    },
    title: {
      description: "Frequently asked question",
      type: "string",
    },
  };

  const requiredFields = ["title", "answer"];
  const languages = req.body.languages;

  if (req.body.manageLanguage) {
    for (let i = 0; i < languages.length; i++) {
      storedProperties["title_" + languages[i]] = {
        description:
          "Frequently asked question translated into " +
          functions.getLanguageDisplayName(languages[i]),
        type: "string",
      };
      requiredFields.push("title_" + languages[i]);

      storedProperties["answer_" + languages[i]] = {
        description:
          "Answer to the frequently asked question translated into " +
          functions.getLanguageDisplayName(languages[i]),
        type: "string",
      };
      requiredFields.push("answer_" + languages[i]);
    }
  }

  debug("storedProperties", storedProperties);

  const faqSchema = {
    properties: {
      faqs: {
        description:
          "An array of " + req.body.faqNumber + " frequently asked questions",
        items: {
          properties: storedProperties,
          required: requiredFields,
          type: "object",
        },
        required: ["faqs"],
        type: "array",
      },
    },
    type: "object",
  };

  const response = await openai.chat.completions.create({
    functions: [{ name: "get_faqs", parameters: faqSchema }],
    messages: [
      {
        content:
          "You are an administrator responsible for defining frequently asked questions.",
        role: "system",
      },
      {
        content:
          "Create a list of frequently asked questions and answers on the subject of: " +
          req.body.faqTopic,
        role: "user",
      },
    ],
    model: req.body.config.model,
    temperature: 0.6,
  });

  let faqs = JSON.parse(
    response.choices[0].message.function_call.arguments,
  ).faqs;

  debug(JSON.stringify(faqs));

  for (let i = 0; i < faqs.length; i++) {
    let postBody = {
      contentStructureId: req.body.structureId,
      siteId: req.body.siteId,
      structuredContentFolderId: req.body.folderId,
      taxonomyCategoryIds: functions.returnArraySet(req.body.categoryIds),
      title: faqs[i].title,
      viewableBy: req.body.viewOptions,
    };

    let setContentFields = [
      {
        contentFieldValue: {
          data: faqs[i].answer,
        },
        name: "Answer",
      },
    ];

    if (req.body.manageLanguage) {
      let contentFieldValues = {};
      let titleValues = {};

      for (let l = 0; l < languages.length; l++) {
        contentFieldValues = {};
        titleValues = {};

        for (const [key, value] of Object.entries(faqs[i])) {
          try {
            if (key.indexOf("_")) {
              let keySplit = key.split("_");

              if (keySplit[0] == "title") titleValues[keySplit[1]] = value;

              if (keySplit[0] == "answer")
                contentFieldValues[keySplit[1]] = { data: value };
            }
          } catch (error) {
            debug(
              "unable to process translation for faq " +
                l +
                " : " +
                languages[l],
            );
            debug(error);
          }
        }
      }

      setContentFields[0]["contentFieldValue_i18n"] = contentFieldValues;
      postBody["title_i18n"] = titleValues;
    }

    postBody["contentFields"] = setContentFields;

    debug("postBody", JSON.stringify(postBody));

    try {
      const axios = axiosInstance(req, res, {
        "Accept-Language": req.body.defaultLanguage,
      });

      const response = await axios.post(
        `/o/headless-delivery/v1.0/sites/${req.body.siteId}/structured-contents`,
        postBody,
      );

      debug(response.data);
    } catch (error) {
      debug(error);
    }
  }

  let end = new Date().getTime();

  res.status(200).json({
    result: "Completed in " + functions.millisToMinutesAndSeconds(end - start),
  });
}
