import axios from 'axios';
import OpenAI from 'openai';

import functions from '../../utils/functions';
import { logger } from '../../utils/logger';

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

  let languages = req.body.languages;

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
                    description: 'The name of the child category.',
                    type: 'string',
                  },
                },
                required: ['name'],
                type: 'object',
              },
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

  if (req.body.manageLanguage) {
    for (let i = 0; i < languages.length; i++) {
      categoriesSchema.properties.categories.items.properties[
        'name_' + languages[i]
      ] = {
        description:
          'The name of the category translated into ' +
          functions.getLanguageDisplayName(languages[i]),
        type: 'string',
      };
      categoriesSchema.properties.categories.items.required.push(
        'name_' + languages[i]
      );

      categoriesSchema.properties.categories.items.properties.childcategories.items.properties[
        'name_' + languages[i]
      ] = {
        description:
          'The name of the child category translated into ' +
          functions.getLanguageDisplayName(languages[i]),
        type: 'string',
      };
      categoriesSchema.properties.categories.items.properties.childcategories.items.required.push(
        'name_' + languages[i]
      );
    }
  }

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
          'I need ' +
          req.body.vocabularyDescription +
          '. ' +
          'Create ' +
          req.body.categorytNumber +
          ' categories and ' +
          req.body.childCategorytNumber +
          ' child categories related to this topic. ' +
          'Do not include double quotes in the response.',
        role: 'user',
      },
    ],
    model: req.body.config.model,
    temperature: 0.6,
  });

  let categories = JSON.parse(
    response.choices[0].message.function_call.arguments
  ).categories;
  debug(JSON.stringify(categories));

  // check if vocabulary exists

  let vocabularyId = await getExistingVocabID(
    req.body.vocabularyName,
    req.body.siteId
  );

  if (vocabularyId > 0) {
    debug('Using existing vocabularyId: ' + vocabularyId);
  } else {
    vocabularyId = await createVocabulary(
      req.body.vocabularyName,
      req.body.siteId,
      debug
    );
  }

  for (let i = 0; i < categories.length; i++) {
    debug(categories[i]);
    // check if category exists

    let categoryId = await getExistingCategoryID(
      categories[i].name,
      vocabularyId
    );

    if (categoryId > 0) {
      debug('Using existing categoryId: ' + categoryId);
    } else {
      categoryId = await createCategory(
        categories[i],
        vocabularyId,
        req.body.manageLanguage,
        debug
      );
    }

    let childcategories = categories[i].childcategories;

    debug(categoryId + ' has ' + childcategories.length + ' child category.');

    for (let j = 0; j < childcategories.length; j++) {
      let childOrgId = await createChildCategory(
        childcategories[j],
        categoryId,
        req.body.manageLanguage,
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
    debug(error);
  }

  return vocabularyId;
}

async function createCategory(category, parentVocabId, manageLanguage, debug) {
  let categoryJson = {
    name: category.name,
    taxonomyVocabularyId: parentVocabId,
  };

  if (manageLanguage) {
    let nameValues = {};
    for (const key in category) {
      if (key.indexOf('name_') >= 0) {
        let keySplit = key.split('_');
        if (keySplit[0] == 'name') {
          nameValues[keySplit[1]] = category[key];
        }
      }
    }

    categoryJson['name_i18n'] = nameValues;
  }

  debug('categoryJson');
  debug(categoryJson);

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
    debug(error.response.data.status + ':' + error.response.data.title);
  }

  return returnid;
}

async function createChildCategory(
  category,
  parentCategoryId,
  manageLanguage,
  debug
) {
  let categoryJson = {
    name: category.name,
    parentTaxonomyCategory: { id: parentCategoryId },
  };

  if (manageLanguage) {
    let nameValues = {};
    for (const key in category) {
      if (key.indexOf('name_') >= 0) {
        let keySplit = key.split('_');
        if (keySplit[0] == 'name') {
          nameValues[keySplit[1]] = category[key];
        }
      }
    }

    categoryJson['name_i18n'] = nameValues;
  }

  debug('categoryJson');
  debug(categoryJson);

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
    debug(error.response.data.status + ':' + error.response.data.title);
  }

  return returnid;
}

async function getExistingVocabID(name, globalSiteId) {
  name = name.replaceAll("'", "''");
  let filter = "name eq '" + name + "'";

  let apiPath =
    process.env.LIFERAY_PATH +
    '/o/headless-admin-taxonomy/v1.0/sites/' +
    globalSiteId +
    '/taxonomy-vocabularies?filter=' +
    encodeURI(filter);

  let options = functions.getAPIOptions('GET', 'en-US');

  try {
    const vocabResponse = await axios.get(apiPath, options);

    if (vocabResponse.data.items.length > 0) {
      return vocabResponse.data.items[0].id;
    } else {
      return -1;
    }
  } catch (error) {
    debug(error.response.data.status + ':' + error.response.data.title);
  }
}

async function getExistingCategoryID(name, vocabId) {
  name = name.replaceAll("'", "''");
  let filter = "name eq '" + name + "'";

  let apiPath =
    process.env.LIFERAY_PATH +
    '/o/headless-admin-taxonomy/v1.0/taxonomy-vocabularies/' +
    vocabId +
    '/taxonomy-categories?filter=' +
    encodeURI(filter);

  let options = functions.getAPIOptions('GET', 'en-US');

  try {
    const categoryResponse = await axios.get(apiPath, options);

    if (categoryResponse.data.items.length > 0) {
      return categoryResponse.data.items[0].id;
    } else {
      return -1;
    }
  } catch (error) {
    debug(error);
  }
}
