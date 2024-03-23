import { AxiosInstance } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

import schema, { z } from "../../schemas/zod";
import { axiosInstance } from "../../services/liferay";
import functions from "../../utils/functions";
import { logger } from "../../utils/logger";

const debug = logger("Categories - Action");

export default async function Action(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const start = new Date().getTime();

  const categoryPayload = req.body as z.infer<typeof schema.category>;

  const { categorytNumber, childCategorytNumber, languages, manageLanguage } =
    categoryPayload;

  const openai = new OpenAI({
    apiKey: req.body.config.openAIKey,
  });

  const categoriesSchema = {
    properties: {
      categories: {
        description: `An array of ${categorytNumber} category names`,
        items: {
          properties: {
            childcategories: {
              description: `An array of ${childCategorytNumber} child categories.`,
              items: {
                properties: {
                  name: {
                    description: "The name of the child category.",
                    type: "string",
                  },
                },
                required: ["name"],
                type: "object",
              },
              type: "array",
            },
            name: {
              description: "The name of the category.",
              type: "string",
            },
          },
          required: ["name", "childcategories"],
          type: "object",
        },
        required: ["categories"],
        type: "array",
      },
    },
    type: "object",
  };

  if (manageLanguage) {
    for (const language of languages) {
      categoriesSchema.properties.categories.items.properties[
        "name_" + language
      ] = {
        description:
          "The name of the category translated into " +
          functions.getLanguageDisplayName(language),
        type: "string",
      };

      categoriesSchema.properties.categories.items.required.push(
        "name_" + language,
      );

      categoriesSchema.properties.categories.items.properties.childcategories.items.properties[
        "name_" + language
      ] = {
        description:
          "The name of the child category translated into " +
          functions.getLanguageDisplayName(language),
        type: "string",
      };

      categoriesSchema.properties.categories.items.properties.childcategories.items.required.push(
        "name_" + language,
      );
    }
  }

  const response = await openai.chat.completions.create({
    functions: [{ name: "get_categories", parameters: categoriesSchema }],
    messages: [
      {
        content:
          "You are an category manager responsible for listing the categories for your company.",
        role: "system",
      },
      {
        content: `I need ${categoryPayload.vocabularyDescription}. Create ${categoryPayload.categorytNumber} categories and ${categoryPayload.childCategorytNumber} child categories related to this topic. Do not include double quotes in the response.`,
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

  let vocabularyId = await getExistingVocabID(axios, req.body);

  if (vocabularyId > 0) {
    debug("Using existing vocabularyId: " + vocabularyId);
  } else {
    vocabularyId = await createVocabulary(axios, req.body);
  }

  for (const category of categories) {
    let categoryId = await getExistingCategoryID(
      axios,
      category.name,
      vocabularyId,
    );

    if (categoryId > 0) {
      debug("Using existing categoryId: " + categoryId);
    } else {
      categoryId = await createCategory(
        axios,
        category,
        vocabularyId,
        categoryPayload,
      );
    }

    const childcategories = category.childcategories;

    debug(categoryId + " has " + childcategories.length + " child category.");

    for (const childCategory of childcategories) {
      await createChildCategory(
        axios,
        childCategory,
        categoryId,
        req.body.manageLanguage,
      );
    }
  }

  let end = new Date().getTime();

  res.status(200).json({
    result: "Completed in " + functions.millisToMinutesAndSeconds(end - start),
  });
}

async function createVocabulary(
  axios: AxiosInstance,
  category: z.infer<typeof schema.category>,
) {
  try {
    const vocabResponse = await axios.post(
      `/o/headless-admin-taxonomy/v1.0/sites/${category.siteId}/taxonomy-vocabularies`,
      { name: category.vocabularyName },
    );

    return vocabResponse.data.id;
  } catch (error) {
    debug(error);
  }

  return "";
}

async function createCategory(
  axios: AxiosInstance,
  category,
  parentVocabId,
  categoryPayload: z.infer<typeof schema.category>,
) {
  const categoryJson = {
    name: category.name,
    taxonomyVocabularyId: parentVocabId,
  };

  if (categoryPayload.manageLanguage) {
    let nameValues = {};
    for (const key in category) {
      if (key.indexOf("name_") >= 0) {
        let keySplit = key.split("_");
        if (keySplit[0] == "name") {
          nameValues[keySplit[1]] = category[key];
        }
      }
    }

    categoryJson["name_i18n"] = nameValues;
  }

  debug({ categoryJson });

  try {
    const response = await axios.post(
      `/o/headless-admin-taxonomy/v1.0/taxonomy-vocabularies/${parentVocabId}/taxonomy-categories`,
      categoryJson,
    );

    return response.data.id;
  } catch (error) {
    debug(error.response.data.status + ":" + error.response.data.title);
  }

  return 0;
}

async function createChildCategory(
  axios: AxiosInstance,
  category,
  parentCategoryId,
  manageLanguage,
) {
  let categoryJson = {
    name: category.name,
    parentTaxonomyCategory: { id: parentCategoryId },
  };

  if (manageLanguage) {
    let nameValues = {};
    for (const key in category) {
      if (key.indexOf("name_") >= 0) {
        let keySplit = key.split("_");
        if (keySplit[0] == "name") {
          nameValues[keySplit[1]] = category[key];
        }
      }
    }

    categoryJson["name_i18n"] = nameValues;
  }

  debug({ categoryJson });

  try {
    const response = await axios.post(
      `/o/headless-admin-taxonomy/v1.0/taxonomy-categories/${parentCategoryId}/taxonomy-categories`,
      categoryJson,
    );

    return response.data.id;
  } catch (error) {
    debug(error.response.data.status + ":" + error.response.data.title);
  }

  return 0;
}

async function getExistingVocabID(
  axios: AxiosInstance,
  category: z.infer<typeof schema.category>,
) {
  let { siteId, vocabularyName } = category;

  vocabularyName = vocabularyName.replaceAll("'", "''");

  let filter = "name eq '" + vocabularyName + "'";

  try {
    const vocabResponse = await axios.get(
      `/o/headless-admin-taxonomy/v1.0/sites/${siteId}/taxonomy-vocabularies?filter=${encodeURI(filter)}`,
    );

    if (vocabResponse.data.items.length > 0) {
      return vocabResponse.data.items[0].id;
    } else {
      return -1;
    }
  } catch (error) {
    debug(error.response.data.status + ":" + error.response.data.title);
  }
}

async function getExistingCategoryID(
  axios: AxiosInstance,
  name: string,
  vocabularyId: string,
) {
  name = name.replaceAll("'", "''");
  let filter = "name eq '" + name + "'";

  try {
    const categoryResponse = await axios.get(
      `/o/headless-admin-taxonomy/v1.0/taxonomy-vocabularies/${vocabularyId}/taxonomy-categories?filter=${encodeURI(filter)}`,
    );

    if (categoryResponse.data.items.length > 0) {
      return categoryResponse.data.items[0].id;
    } else {
      return -1;
    }
  } catch (error) {
    debug(error);
  }
}
