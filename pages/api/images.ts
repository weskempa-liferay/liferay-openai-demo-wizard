import fs from 'fs';
import http from 'https';
import OpenAI from 'openai';
import request from 'request';

import functions from '../utils/functions';
import { logger } from '../utils/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const debug = logger('ImagesAction');
const runCountMax = 10;

export default async function ImagesAction(req, res) {
  let start = new Date().getTime();

  const runCount = req.body.imageNumber;
  const imageDescription = req.body.imageDescription;
  const imageGeneration = req.body.imageGeneration;

  debug('requesting ' + runCount + ' images');
  debug(`include images: ${imageGeneration} ${imageDescription}`);

  let pictureDescription = imageDescription;

  for (let i = 0; i < runCount; i++) {
    if (req.body.imageStyle) {
      pictureDescription =
        'Create an image in the style of ' +
        req.body.imageStyle +
        '. ' +
        imageDescription;
    }

    debug('pictureDescription: ' + pictureDescription);

    try {
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
          postImageToLiferay(file, req);
        });
      });
    } catch (error) {
      if (error.response) {
        console.log(error.response.status);
      } else {
        console.log(error.message);
      }
    }

    if (i >= runCountMax) break;
  }

  let end = new Date().getTime();

  debug('Completed in ' + (end - start) + ' milliseconds');

  res.status(200).json({
    result: 'Completed in ' + functions.millisToMinutesAndSeconds(end - start),
  });
}

function postImageToLiferay(file, req) {
  const imageFolderId = parseInt(req.body.imageFolderId);

  let imageApiPath =
    process.env.LIFERAY_PATH +
    '/o/headless-delivery/v1.0/document-folders/' +
    imageFolderId +
    '/documents';

  debug(imageApiPath);

  let fileStream = fs.createReadStream(process.cwd() + '/' + file.path);
  const options = functions.getFilePostOptions(
    imageApiPath,
    fileStream,
    'file'
  );

  setTimeout(function () {
    request(options, function (err, res, body) {
      if (err) console.log(err);

      debug(res);
    });
  }, 100);
}
