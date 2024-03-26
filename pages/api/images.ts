import { AxiosInstance } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

import schema, { z } from "../../schemas/zod";
import { axiosInstance } from "../../services/liferay";
import { getDownloadFormData } from "../../utils/download";
import functions from "../../utils/functions";
import { logger } from "../../utils/logger";

const debug = logger("ImagesAction");
const runCountMax = 10;

export type Size = '256x256' | '512x512' | '1024x1024' | '1024x1792' | '1792x1024';


export default async function ImagesAction(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const start = new Date().getTime();

  const openai = new OpenAI({
    apiKey: req.body.config.openAIKey,
  });

  debug(req.body);

  let { imageDescription, imageGeneration, imageNumber, imageStyle } =
    req.body as z.infer<typeof schema.image>;

  const axios = axiosInstance(req, res);

  for (let i = 0; i < Number(imageNumber); i++) {
    if (req.body.imageStyle) {
      imageDescription = `Create an image in the style of ${imageStyle}. ${imageDescription}`;
    }

    debug("imageDescription: " + imageDescription);
    debug("req.body.imageGenerationQuality: " + req.body.imageGenerationQuality);
    debug("req.body.imageGenerationSize: " + req.body.imageGenerationSize);

    let imageSize = req.body.imageGenerationSize.split("-")[0] as Size;

    try {
      const imageResponse = await openai.images.generate({
        model: imageGeneration,
        n: 1,
        prompt: imageDescription,
        quality: req.body.imageGenerationQuality,
        size: imageSize,
      });

      debug(imageResponse.data[0].url);

      debug("In Exports, getGeneratedImage:" + imageResponse);

      const formData = await getDownloadFormData(imageResponse.data[0].url);

      await postImageToLiferay(axios, formData, req.body.imageFolderId);
    } catch (error) {
      debug(error);
    }

    if (i >= runCountMax) break;
  }

  const end = new Date().getTime();

  debug("Completed in " + (end - start) + " milliseconds");

  res.status(200).json({
    result: "Completed in " + functions.millisToMinutesAndSeconds(end - start),
  });
}

async function postImageToLiferay(
  axios: AxiosInstance,
  formData: FormData,
  imageFolderId: number,
) {
  await axios.post(
    `/o/headless-delivery/v1.0/document-folders/${imageFolderId}/documents`,
    formData,
    {
      headers: {
        "Content-Type": "application/form-data",
      },
    },
  );
}
