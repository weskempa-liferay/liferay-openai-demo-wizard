import OpenAI from 'openai';

var functions = require('../utils/functions');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const axios = require('axios');

let options = functions.getAPIOptions('POST', 'en-US');

export default async function Action(req, res) {
  let start = new Date().getTime();

  const debug = req.body.debugMode;

  if (debug)
    console.log(
      'kbFolderNumber:' +
        req.body.kbFolderNumber +
        ', kbArticleNumber:' +
        req.body.kbArticleNumber
    );
  //TODO Liferay's API does not yet support Suggestions. Once that is available development can continue.

  const knowledgeBaseSchema = {
    properties: {
      categories: {
        description:
          'An array of ' +
          req.body.kbFolderNumber +
          ' or more knowledge base categories related to the given topic',
        items: {
          properties: {
            articles: {
              description:
                'An array of ' +
                req.body.kbArticleNumber +
                ' knowledge base articles within the category',
              items: {
                properties: {
                  articleBody: {
                    description:
                      'The full message as seen in the knowledge base article body. The knowledge base article should be ' +
                      req.body.kbArticleLength +
                      ' words or more.',
                    type: 'string',
                  },
                  headline: {
                    description: 'The title of the knowledge base article',
                    type: 'string',
                  },
                },
                type: 'object',
              },
              required: ['headline', 'articleBody', 'articles'],
              type: 'array',
            },
            category: {
              description: 'Name of the knowledge base category',
              type: 'string',
            },
          },
          type: 'object',
        },
        required: ['categories'],
        type: 'array',
      },
    },
    type: 'object',
  };

  const response = await openai.chat.completions.create({
    functions: [
      { name: 'get_knowledge_base_content', parameters: knowledgeBaseSchema },
    ],
    messages: [
      {
        content:
          'You are a knowledge base administrator responsible for managing the knowledge base for your company.',
        role: 'system',
      },
      {
        content:
          "Create a list of knowledge base categories and articles on the subject of '" +
          req.body.kbTopic +
          "'. It is important to include " +
          req.body.kbFolderNumber +
          ' knowledge base categories and ' +
          req.body.kbArticleNumber +
          ' knowledge base articles in each category. ' +
          'Each knowledge base article should be ' +
          req.body.kbArticleLength +
          ' words or more.',
        role: 'user',
      },
    ],
    model: 'gpt-3.5-turbo',
    temperature: 0.6,
  });

  let categories = JSON.parse(
    response.choices[0].message.function_call.arguments
  ).categories;
  if (debug) console.log(JSON.stringify(categories));

  for (let i = 0; categories.length > i; i++) {
    let sectionApiPath =
      process.env.LIFERAY_PATH +
      '/o/headless-delivery/v1.0/sites/' +
      req.body.siteId +
      '/knowledge-base-folders';

    if (debug) console.log(sectionApiPath);

    let kbSectionJson = {
      name: categories[i].category,
    };

    let kbSectionResponse = await axios.post(
      sectionApiPath,
      kbSectionJson,
      options
    );
    let sectionId = kbSectionResponse.data.id;

    if (debug)
      console.log(
        'C:' + categories[i].category + ' created with id ' + sectionId
      );

    let articles = categories[i].articles;

    for (let t = 0; t < articles.length; t++) {
      let threadApiPath =
        process.env.LIFERAY_PATH +
        '/o/headless-delivery/v1.0/knowledge-base-folders/' +
        sectionId +
        '/knowledge-base-articles';

      if (debug) console.log(threadApiPath);

      let kbThreadJson = {
        articleBody: articles[t].articleBody,
        title: articles[t].headline,
      };

      let kbThreadResponse = await axios.post(
        threadApiPath,
        kbThreadJson,
        options
      );
      let threadId = kbThreadResponse.data.id;

      if (debug)
        console.log(
          'T:' + articles[t].headline + ' created with id ' + threadId
        );

      /*
        let suggestions = articles[t].suggestions;
        for(let m=0; m<suggestions.length; m++){

            let suggestionApiPath = process.env.LIFERAY_PATH + "/o/"+threadId+"/";

            if(debug) console.log(suggestionApiPath);
    
            let kbMessageJson = {
                "articleBody": suggestions[m].suggestion
            }
    
            let kbSuggestionThreadResponse = await axios.post(suggestionApiPath, kbSuggestionJson, options);
            let suggestionId = kbMessageThreadResponse.data.id;
    
            if(debug) console.log("M:" + suggestions[m].suggestion + " created with id " + suggestionId);
        }
        */
    }
  }

  let end = new Date().getTime();
  res.status(200).json({
    result: 'Completed in ' + functions.millisToMinutesAndSeconds(end - start),
  });
}
