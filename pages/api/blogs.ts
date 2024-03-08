import axios from 'axios';
import fs from 'fs';
import http from 'https';
import OpenAI from 'openai';
import request from 'request';

import functions from '../../utils/functions';
import { logger } from '../../utils/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const debug = logger('Blogs - Action');

export default async function Action(req, res) {
  let start = new Date().getTime();
  debug(req.body);

  const runCount = req.body.blogNumber;
  const imageGeneration = req.body.imageGeneration;

  const runCountMax = 10;
  const blogContentSet = [];

  const schema = {
    properties: {
      articles: {
        description: 'An array of ' + runCount + ' blog articles',
        items: {
          properties: {
            alternativeHeadline: {
              description:
                'A headline that is a summary of the blog article translated into ' +
                functions.getLanguageDisplayName(req.body.blogLanguage),
              type: 'string',
            },
            articleBody: {
              description:
                'The content of the blog article needs to be ' +
                req.body.blogLength +
                ' words or more. Remove any double quotes and translate the article into ' +
                functions.getLanguageDisplayName(req.body.blogLanguage),
              type: 'string',
            },
            headline: {
              description:
                'The title of the blog artcile translated into ' +
                functions.getLanguageDisplayName(req.body.blogLanguage),
              type: 'string',
            },
            picture_description: {
              description:
                'A description of an appropriate image for this blog in three sentences.',
              type: 'string',
            },
          },
          required: [
            'headline',
            'alternativeHeadline',
            'articleBody',
            'picture_description',
          ],
          type: 'object',
        },
        required: ['articles'],
        type: 'array',
      },
    },
    type: 'object',
  };

  let response = await openai.chat.completions.create({
    function_call: { name: 'get_blog_content' },
    functions: [{ name: 'get_blog_content', parameters: schema }],
    messages: [
      { content: 'You are a blog author.', role: 'system' },
      {
        content:
          'Write blogs on the subject of: ' +
          req.body.blogTopic +
          ". It is important that each blog article's content is " +
          req.body.blogLength +
          ' words or more and translated into ' +
          functions.getLanguageDisplayName(req.body.blogLanguage),
        role: 'user',
      },
    ],
    model: req.body.config.model,
    temperature: 0.8,
  });

  let blogJsonArticles = JSON.parse(
    response.choices[0].message.function_call.arguments
  ).articles;

  for (let i = 0; i < blogJsonArticles.length; i++) {
    let blogJson = blogJsonArticles[i];

    let pictureDescription = blogJson.picture_description;
    delete blogJson.picture_description;

    if (req.body.imageStyle) {
      pictureDescription = `Create an image in the style of ${req.body.imageStyle}. ${pictureDescription}`;
    }

    blogJson.articleBody = blogJson.articleBody.replace(
      /(?:\r\n|\r|\n)/g,
      '<br>'
    );

    debug(`pictureDescription: ${pictureDescription}`);

    try {
      if (imageGeneration != 'none') {
        const imageResponse = await openai.images.generate({
          model: imageGeneration,
          n: 1,
          prompt: pictureDescription,
          size: '1024x1024',
        });

        debug(imageResponse.data[0].url);

        const timestamp = new Date().getTime();
        const file = fs.createWriteStream(
          'generatedimages/img' + timestamp + '-' + i + '.jpg'
        );

        debug('In Exports, getGeneratedImage:' + imageResponse);

        http.get(imageResponse.data[0].url, function (response) {
          response.pipe(file);

          file.on('finish', () => {
            file.close();
            postImageToLiferay(file, req, blogJson);
          });
        });
      } else {
        postBlogToLiferay(req, blogJson, 0);
      }
    } catch (error) {
      if (error.response) {
        debug(error.response.status);
      } else {
        debug(error.message);
      }
    }

    blogContentSet.push(blogJson);

    if (i >= runCountMax) break;
  }

  res.status(200).json({ result: JSON.stringify(blogContentSet) });
}

function postImageToLiferay(file, req, blogJson) {
  let blogImageApiPath =
    process.env.LIFERAY_PATH +
    '/o/headless-delivery/v1.0/sites/' +
    req.body.siteId +
    '/blog-posting-images';

  debug(blogImageApiPath);

  let fileStream = fs.createReadStream(process.cwd() + '/' + file.path);
  const options = functions.getFilePostOptions(
    blogImageApiPath,
    fileStream,
    'file'
  );

  setTimeout(function () {
    request(options, function (err, res, body) {
      if (err) debug(err);

      postBlogToLiferay(req, blogJson, JSON.parse(body).id);
    });
  }, 100);
}

async function postBlogToLiferay(req, blogJson, imageId) {
  if (imageId) {
    blogJson.image = {
      imageId: imageId,
    };
  }

  blogJson.viewableBy = req.body.viewOptions;

  let apiPath =
    process.env.LIFERAY_PATH +
    '/o/headless-delivery/v1.0/sites/' +
    req.body.siteId +
    '/blog-postings';

  let options = functions.getAPIOptions('POST', 'en-US');

  try {
    const response = await axios.post(apiPath, blogJson, options);

    debug('Blog added with ID:' + response.data.id);
    debug('Blog Import Process Complete.');
  } catch (error) {
    debug(error);
  }
}
