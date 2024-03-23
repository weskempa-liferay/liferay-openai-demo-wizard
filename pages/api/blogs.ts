import baseAxios, { AxiosInstance } from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

import schema, { z } from '../../schemas/zod';
import { axiosInstance } from '../../services/liferay';
import { getDownloadFormData } from '../../utils/download';
import functions from '../../utils/functions';
import { logger } from '../../utils/logger';

const debug = logger('Blogs - Action');

type BlogPayload = z.infer<typeof schema.blog>;

export default async function Action(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const blogPayload = req.body as BlogPayload;

  const { blogLanguage, blogLength, blogNumber, imageGeneration } = blogPayload;

  const openai = new OpenAI({
    apiKey: req.body.config.openAIKey,
  });

  const runCountMax = 10;
  const blogContentSet = [];

  const parameters = {
    properties: {
      articles: {
        description: `An array of ${blogNumber} blog articles`,
        items: {
          properties: {
            alternativeHeadline: {
              description:
                'A headline that is a summary of the blog article translated into ' +
                functions.getLanguageDisplayName(blogLanguage),
              type: 'string',
            },
            articleBody: {
              description:
                'The content of the blog article needs to be ' +
                blogLength +
                ' words or more. Remove any double quotes and translate the article into ' +
                functions.getLanguageDisplayName(blogLanguage),
              type: 'string',
            },
            headline: {
              description:
                'The title of the blog artcile translated into ' +
                functions.getLanguageDisplayName(blogLanguage),
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

  const response = await openai.chat.completions.create({
    function_call: { name: 'get_blog_content' },
    functions: [{ name: 'get_blog_content', parameters }],
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

  const blogJsonArticles = JSON.parse(
    response.choices[0].message.function_call.arguments
  ).articles;

  const axios = axiosInstance(req, res);

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
      let imageId = 0;
      if (imageGeneration !== 'none') {
        const imageResponse = await openai.images.generate({
          model: imageGeneration,
          n: 1,
          prompt: pictureDescription,
          size: '1024x1024',
        });

        const formData = await getDownloadFormData(imageResponse.data[0].url);

        imageId = await postImageToLiferay(formData, axios, req.body.siteId);
      }

      if (imageId) {
        blogJson.image = {
          imageId,
        };
      }

      await postBlogToLiferay(axios, blogPayload, blogJson);
    } catch (error) {
      if (error.response) {
        debug(error.response.status);
      } else {
        debug(error.message);
      }
    }

    blogContentSet.push(blogJson);

    if (i >= runCountMax) {
      break;
    }
  }

  res.status(200).json({ result: JSON.stringify(blogContentSet) });
}

async function postBlogToLiferay(
  axios: AxiosInstance,
  blogPayload: BlogPayload,
  blogJson
) {
  try {
    const response = await axios.post(
      `/o/headless-delivery/v1.0/sites/${blogPayload.siteId}/blog-postings`,
      blogJson
    );

    debug('Blog added with ID:' + response.data.id);
    debug('Blog Import Process Complete.');
  } catch (error) {
    debug(error);
  }
}

async function postImageToLiferay(
  formData: FormData,
  axios: AxiosInstance,
  siteId
) {
  const { data } = await axios.post(
    `/o/headless-delivery/v1.0/sites/${siteId}/blog-posting-images`,
    formData,
    {
      headers: {
        'Content-Type': 'application/form-data',
      },
    }
  );

  return data.id;
}
