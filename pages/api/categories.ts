import axios from 'axios';
import OpenAI from 'openai';

import functions from '../utils/functions';
import { logger } from '../utils/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const debug = logger('Categories - Action');

export default async function Action(req, res) {
  let start = new Date().getTime();

  debug(
      'vocabularyName: ' +
        req.body.vocabularyName +
        ', categorytNumber: ' +
        req.body.categorytNumber +
        ', childCategorytNumber: ' +
        req.body.childCategorytNumber +
        ', siteId: ' +
        req.body.siteId
    );

  const categoriesSchema = {
    properties: {
      categories: {
        description:
          'An array of ' + req.body.categorytNumber + ' category names',
        items: {
          properties: {
            childcategories: {
              description:
                'An array of ' +
                req.body.childCategorytNumber +
                ' child categories.',
              items: {
                properties: {
                  name: {
                    description: 'The name of the category.',
                    type: 'string',
                  },
                },
                type: 'object',
              },
              required: ['name'],
              type: 'array',
            },
            name: {
              description: 'The name of the category.',
              type: 'string',
            },
          },
          required: ['name', 'childcategories'],
          type: 'object',
        },
        required: ['categories'],
        type: 'array',
      },
    },
    type: 'object',
  };

  const response = await openai.chat.completions.create({
    functions: [{ name: 'get_categories', parameters: categoriesSchema }],
    messages: [
      {
        content:
          'You are an category manager responsible for listing the categories for your company.',
        role: 'system',
      },
      {
        content:
          'I need ' + req.body.vocabularyDescription + '. ' +
          'Create the expected number of categories, and child categories related to this topic. ' +
          'Do not include double quotes in the response.',
        role: 'user',
      },
    ],
    model: 'gpt-3.5-turbo',
    temperature: 0.6,
  });

  let categories = JSON.parse(
    response.choices[0].message.function_call.arguments
  ).categories;
  debug(JSON.stringify(categories));

  let vocabularyId = await createVocabulary(
    req.body.vocabularyName,
    req.body.siteId,
    debug
  );

  for (let i = 0; i < categories.length; i++) {
    debug(categories[i]);

    let categoryId = await createCategory(
      categories[i].name,
      vocabularyId,
      debug
    );
    let childcategories = categories[i].childcategories;

    debug(
      categoryId + ' has ' + childcategories.length + ' child category.'
    );

    for (let j = 0; j < childcategories.length; j++) {
      let childOrgId = await createChildCategory(
        childcategories[j].name,
        categoryId,
        debug
      );
    }
  }

  let end = new Date().getTime();

  res.status(200).json({
    result: 'Completed in ' + functions.millisToMinutesAndSeconds(end - start),
  });
}

async function createVocabulary(vocabularyName, siteId, debug) {
  /* Setup Vocabulary */

  let apiPath =
    process.env.LIFERAY_PATH +
    '/o/headless-admin-taxonomy/v1.0/sites/' +
    siteId +
    '/taxonomy-vocabularies';
  let vocabPostObj = { name: vocabularyName };

  let options = functions.getAPIOptions('POST', '');
  let vocabularyId = '';

  try {
    const vocabResponse = await axios.post(apiPath, vocabPostObj, options);

    vocabularyId = vocabResponse.data.id;

    debug('vocabularyId is ' + vocabResponse.data);
  } catch (error) {
    console.log(error);
    vocabularyId = error;
  }

  return vocabularyId;
}

async function createCategory(category, parentVocabId, debug) {
  let categoryJson = { name: category, taxonomyVocabularyId: parentVocabId };

  let categoriesApiPath =
    process.env.LIFERAY_PATH +
    '/o/headless-admin-taxonomy/v1.0/taxonomy-vocabularies/' +
    parentVocabId +
    '/taxonomy-categories';

  const options = functions.getAPIOptions('POST', '');

  let returnid = 0;

  try {
    const response = await axios.post(categoriesApiPath, categoryJson, options);

    returnid = response.data.id;

    debug('returned id:' + returnid);
  } catch (error) {
    console.log(error);
  }

  return returnid;
}

async function createChildCategory(category, parentCategoryId, debug) {
  let categoryJson = {
    name: category,
    parentTaxonomyCategory: { id: parentCategoryId },
  };

  let categoriesApiPath =
    process.env.LIFERAY_PATH +
    '/o/headless-admin-taxonomy/v1.0/taxonomy-categories/' +
    parentCategoryId +
    '/taxonomy-categories';

  const options = functions.getAPIOptions('POST', '');

  let returnid = 0;

  try {
    const response = await axios.post(categoriesApiPath, categoryJson, options);

    returnid = response.data.id;

    debug('returned id:' + returnid);
  } catch (error) {
    console.log(error);
  }

  return returnid;
}
