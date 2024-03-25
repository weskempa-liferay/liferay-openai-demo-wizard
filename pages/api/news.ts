import { AxiosInstance } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

import schema, { z } from "../../schemas/zod";
import { axiosInstance } from "../../services/liferay";
import { getDownloadFormData } from "../../utils/download";
import functions from "../../utils/functions";
import { logger } from "../../utils/logger";

const debug = logger("NewsAction");

type NewsPayload = z.infer<typeof schema.news>;

const runCountMax = 10;

export default async function NewsAction(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const start = new Date().getTime();
  let successes = 0;

  const newsPayload = req.body as NewsPayload;

  const axios = axiosInstance(req, res);

  const openai = new OpenAI({
    apiKey: req.body.config.openAIKey,
  });

  const runCount = req.body.newsNumber;
  const imageGeneration = req.body.imageGeneration;

  debug("requesting " + runCount + " new(s) articles");
  debug("include images: " + imageGeneration);

  let newsJson, response;
  const newsContentSet = [];

  const storedProperties = {
    alternativeHeadline: {
      description: "A headline that is a summary of the news article",
      type: "string",
    },
    articleBody: {
      description:
        "The content of the news article which should be " +
        req.body.newsLength +
        " words or more.  Remove any double quotes",
      type: "string",
    },
    headline: {
      description: "The title of the news artcile",
      type: "string",
    },
    picture_description: {
      description:
        "A description of an appropriate image for this news in three sentences.",
      type: "string",
    },
  };

  const requiredFields = [
    "headline",
    "alternativeHeadline",
    "articleBody",
    "picture_description",
  ];

  const languages = req.body.languages;

  if (req.body.manageLanguage) {
    for (let i = 0; i < languages.length; i++) {
      storedProperties["headline_" + languages[i]] = {
        description:
          "The title of the news artcile translated into " +
          functions.getLanguageDisplayName(languages[i]),
        type: "string",
      };
      requiredFields.push("headline_" + languages[i]);

      storedProperties["alternativeHeadline_" + languages[i]] = {
        description:
          "A headline that is a summary of the news article translated into " +
          functions.getLanguageDisplayName(languages[i]),
        type: "string",
      };
      requiredFields.push("alternativeHeadline_" + languages[i]);

      storedProperties["articleBody_" + languages[i]] = {
        description:
          "The content of the news article translated into " +
          functions.getLanguageDisplayName(languages[i]),
        type: "string",
      };
      requiredFields.push("articleBody_" + languages[i]);
    }
  }

  const newsSchema = {
    properties: storedProperties,
    required: requiredFields,
    type: "object",
  };

  for (let i = 0; i < runCount; i++) {
    response = await openai.chat.completions.create({
      frequency_penalty: 0.5,
      function_call: { name: "get_news_content" },
      functions: [{ name: "get_news_content", parameters: newsSchema }],
      messages: [
        { content: "You are a news author.", role: "system" },
        {
          content:
            "Write news on the subject of: " +
            req.body.newsTopic +
            ". Each news title needs to be unique. The content of the news article which should be " +
            req.body.newsLength +
            " words or more.",
          role: "user",
        },
      ],
      model: req.body.config.model,
      temperature: 0.8,
    });

    try {
      console.log(response.choices[0].message.function_call.arguments);
      newsJson = JSON.parse(
        response.choices[0].message.function_call.arguments,
      );
    } catch (parseException) {
      console.log("-----------------------------------------------------");
      console.log(
        "********Parse Exception on News Article " + (i + 1) + "********",
      );
      console.log("-----------------------------------------------------");
      console.log(response);
      console.log(response.choices.length);
      console.log(response.choices[0].message);
      console.log("-----------------------------------------------------");
      console.log("------------------------END--------------------------");
      console.log("-----------------------------------------------------");
      continue;
    }

    let pictureDescription = newsJson.picture_description;
    delete newsJson.picture_description;

    if (req.body.imageStyle) {
      pictureDescription =
        "Create an image in the style of " +
        req.body.imageStyle +
        ". " +
        pictureDescription;
    }

    newsJson.articleBody = newsJson.articleBody.replace(
      /(?:\r\n|\r|\n)/g,
      "<br>",
    );

    debug("pictureDescription: " + pictureDescription);

    try {
      let imageId = 0;

      if (imageGeneration !== "none") {
        const imageResponse = await openai.images.generate({
          model: imageGeneration,
          n: 1,
          prompt: pictureDescription,
          size: "1024x1024",
        });

        const formData = await getDownloadFormData(imageResponse.data[0].url);

        console.log("In Exports, getGeneratedImage:" + imageResponse);

        imageId = await postImageToLiferay(formData, newsPayload, axios);
      }

      await postNewsToLiferay(axios, newsPayload, newsJson, imageId);
    } catch (error) {
      if (error.response) {
        console.log(error.response.status);
      } else {
        console.log(error.message);
      }
    }

    newsContentSet.push(newsJson);
    successes++;

    if (i >= runCountMax) break;
  }

  let end = new Date().getTime();

  res.status(200).json({
    result: `Imported ${successes} of ${runCount} News Articles. Completed in ${functions.millisToMinutesAndSeconds(end - start)}`,
  });
}

async function postImageToLiferay(
  formData: FormData,
  newsPayload: NewsPayload,
  axios: AxiosInstance,
) {
  const { imageFolderId, siteId } = newsPayload;

  const { data } = await axios.post(
    imageFolderId
      ? `/o/headless-delivery/v1.0/document-folders/${imageFolderId}/documents`
      : `/o/headless-delivery/v1.0/sites/${siteId}/documents`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return data.id;
}

async function postNewsToLiferay(
  axios: AxiosInstance,
  newsPayload: NewsPayload,
  newsJson: any,
  imageId: number,
) {
  let newsFields = [
    {
      contentFieldValue: {
        data: newsJson.alternativeHeadline,
      },
      name: "Headline",
    },
    {
      contentFieldValue: {
        data: newsJson.articleBody,
      },
      name: "Content",
    },
    {
      contentFieldValue: {
        data: "",
      },
      name: "Image",
    },
  ];

  if (imageId) {
    newsFields[2]["contentFieldValue"]["image"] = {
      id: imageId,
    };
  }

  let titleValues = {};

  if (newsPayload.manageLanguage) {
    let alternativeHeadlineFieldValues = {};
    let articleBodyFieldValues = {};
    let imageValues = {};

    for (let l = 0; l < newsPayload.languages.length; l++) {
      if (imageId) {
        imageValues[newsPayload.languages[l]] = {
          data: "",
          image: {
            id: imageId,
          },
        };
      } else {
        imageValues[newsPayload.languages[l]] = {
          data: "",
        };
      }

      for (const [key, value] of Object.entries(newsJson)) {
        try {
          if (key.indexOf("_") > 0) {
            let keySplit = key.split("_");

            if (keySplit[0] == "headline") titleValues[keySplit[1]] = value;

            if (keySplit[0] == "alternativeHeadline")
              alternativeHeadlineFieldValues[keySplit[1]] = { data: value };

            if (keySplit[0] == "articleBody")
              articleBodyFieldValues[keySplit[1]] = { data: value };
          }
        } catch (error) {
          console.log(
            "unable to process translation for faq " +
              l +
              " : " +
              newsPayload.languages[l],
          );
          debug(error);
        }
      }
    }

    newsFields[0]["contentFieldValue_i18n"] = alternativeHeadlineFieldValues;
    newsFields[1]["contentFieldValue_i18n"] = articleBodyFieldValues;
    newsFields[2]["contentFieldValue_i18n"] = imageValues;
  }

  await axios.post(
    `/o/headless-delivery/v1.0/sites/${newsPayload.siteId}/structured-contents`,
    {
      contentFields: newsFields,
      contentStructureId: newsPayload.structureId,
      structuredContentFolderId: newsPayload.folderId,
      taxonomyCategoryIds: functions.returnArraySet(newsPayload.categoryIds),
      title: newsJson.headline,
      title_i18n: titleValues,
      viewableBy: newsPayload.viewOptions,
    },
  );

  debug("News import process complete.");
}
