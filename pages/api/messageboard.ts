import axios from 'axios';
import OpenAI from 'openai';

import functions from '../../utils/functions';
import { logger } from '../../utils/logger';

const debug = logger('MessageBoardAction');

export default async function MessageBoardAction(req, res) {
  let start = new Date().getTime();

  const openai = new OpenAI({
    apiKey: req.body.config.openAIKey,
  });

  let options = functions.getAPIOptions('POST', 'en-US', req.body.config.base64data);

  debug(req.body);

  const messageBoardSchema = {
    properties: {
      categories: {
        description:
          'An array of ' +
          req.body.mbSectionNumber +
          ' or more message board categories related to the given topic',
        items: {
          properties: {
            category: {
              description:
                'Name of the message board category translated into ' +
                functions.getLanguageDisplayName(req.body.mbLanguage),
              type: 'string',
            },
            threads: {
              description:
                'An array of ' +
                req.body.mbThreadNumber +
                ' message board threads within the category translated into ' +
                functions.getLanguageDisplayName(req.body.mbLanguage),
              items: {
                properties: {
                  articleBody: {
                    description:
                      'The full message as seen in the message board thread body. Use ' +
                      req.body.mbThreadLength +
                      ' words or more. Translated the response into ' +
                      functions.getLanguageDisplayName(req.body.mbLanguage),
                    type: 'string',
                  },
                  headline: {
                    description:
                      'The title of the message board thread. Translated this response into ' +
                      functions.getLanguageDisplayName(req.body.mbLanguage),
                    type: 'string',
                  },
                  messages: {
                    description:
                      'An array of ' +
                      req.body.mbMessageNumber +
                      ' message board messages within the category. Translated this response into ' +
                      functions.getLanguageDisplayName(req.body.mbLanguage),
                    items: {
                      properties: {
                        message: {
                          description:
                            'The user message that relates to the message board threads. Translated this response into ' +
                            functions.getLanguageDisplayName(
                              req.body.mbLanguage
                            ),
                          type: 'string',
                        },
                      },
                      type: 'object',
                    },
                    required: ['messages'],
                    type: 'array',
                  },
                },
                type: 'object',
              },
              required: ['headline', 'articleBody', 'threads'],
              type: 'array',
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
      { name: 'get_message_board_content', parameters: messageBoardSchema },
    ],
    messages: [
      {
        content:
          'You are a message board administrator responsible for managing the message board for your company.',
        role: 'system',
      },
      {
        content:
          "Create a list of message board categories, threads, and messages on the subject of '" +
          req.body.mbTopic +
          "'. It is important to include " +
          req.body.mbSectionNumber +
          ' or more message board categories, ' +
          req.body.mbThreadNumber +
          ' message board threads in each category, and ' +
          req.body.mbMessageNumber +
          ' message board threads in each thread. ' +
          'Each message board thread should be ' +
          req.body.mbThreadLength +
          ' words or more. Translate all responses into ' +
          functions.getLanguageDisplayName(req.body.mbLanguage),
        role: 'user',
      },
    ],
    model: req.body.config.model,
    temperature: 0.6,
  });

  const categories = JSON.parse(
    response.choices[0].message.function_call.arguments
  ).categories;
  debug(JSON.stringify(categories));

  for (let i = 0; categories.length > i; i++) {
    let sectionApiPath =
      req.body.config.serverURL +
      '/o/headless-delivery/v1.0/sites/' +
      req.body.siteId +
      '/message-board-sections';

    debug(sectionApiPath);

    let mbSectionJson = {
      title: categories[i].category,
      viewableBy: req.body.viewOptions,
    };

    let mbSectionResponse = await axios.post(
      sectionApiPath,
      mbSectionJson,
      options
    );
    let sectionId = mbSectionResponse.data.id;

    if (debug)
      console.log(
        'C:' + categories[i].category + ' created with id ' + sectionId
      );

    let threads = categories[i].threads;

    for (let t = 0; t < threads.length; t++) {
      let threadApiPath =
        req.body.config.serverURL +
        '/o/headless-delivery/v1.0/message-board-sections/' +
        sectionId +
        '/message-board-threads';

      debug(threadApiPath);

      let mbThreadJson = {
        articleBody: threads[t].articleBody,
        headline: threads[t].headline,
        viewableBy: req.body.viewOptions,
      };

      let mbThreadResponse = await axios.post(
        threadApiPath,
        mbThreadJson,
        options
      );
      let threadId = mbThreadResponse.data.id;

      if (debug)
        console.log(
          'T:' + threads[t].headline + ' created with id ' + threadId
        );

      let messages = threads[t].messages;
      for (let m = 0; m < messages.length; m++) {
        let messageApiPath =
          req.body.config.serverURL +
          '/o/headless-delivery/v1.0/message-board-threads/' +
          threadId +
          '/message-board-messages';

        debug(messageApiPath);

        let mbMessageJson = {
          articleBody: messages[m].message,
          viewableBy: req.body.viewOptions,
        };

        let mbMessageThreadResponse = await axios.post(
          messageApiPath,
          mbMessageJson,
          options
        );
        let messageId = mbMessageThreadResponse.data.id;

        if (debug)
          console.log(
            'M:' + messages[m].message + ' created with id ' + messageId
          );
      }
    }
  }

  let end = new Date().getTime();
  res.status(200).json({
    result: 'Completed in ' + functions.millisToMinutesAndSeconds(end - start),
  });
}
