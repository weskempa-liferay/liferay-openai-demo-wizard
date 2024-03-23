import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'universal-cookie';

import { APP_CONFIG } from '../components/layout/footer';
import schema, { z } from '../schemas/zod';

const defaultLanguage = 'en-US';

export const axiosInstance = (
  nextApiRequest: NextApiRequest,
  nextApiResponse: NextApiResponse,
  headers?: any
) => {
  const cookies = nextApiRequest.cookies;
  const baseConfig = cookies[APP_CONFIG];

  if (!baseConfig) {
    throw new Error('Unable to create axios instance');
  }

  const config = JSON.parse(
    cookies[APP_CONFIG] as unknown as string
  ) as z.infer<typeof schema.config>;

  const oAuthToken = cookies.oauth_token;

  const liferayAxios = axios.create({
    baseURL: config.serverURL,
    headers: {
      // Accept: "application/json",
      'Accept-Language': defaultLanguage,
      'Content-Type': 'application/json',
      ...(config.authenticationType === 'basic' &&
        config.base64data && {
          Authorization: 'Basic ' + config.base64data,
        }),
      ...headers,
    },
  });

  liferayAxios.interceptors.request.use(async (request) => {
    if (config.authenticationType === 'basic') {
      return request;
    }

    if (oAuthToken) {
      console.log('A valid token was found');
      request.headers.Authorization = oAuthToken;

      return request;
    }

    const searchParams = new URLSearchParams();

    searchParams.append('client_id', config.clientId);
    searchParams.append('client_secret', config.clientSecret);
    searchParams.append('grant_type', 'client_credentials');
    searchParams.append('response_type', 'code');

    const { data, status } = await axios.post(
      config.serverURL + '/o/oauth2/token',
      searchParams
    );

    if (status === 200) {
      const token = `${data.token_type} ${data.access_token}`;

      const expiresIn = new Date(
        data.expires_in * 1000 + new Date().getTime()
      ).toUTCString();

      nextApiResponse.setHeader(
        'Set-Cookie',
        `oauth_token=${token}; Path=/; HttpOnly; Expires=${expiresIn}`
      );

      request.headers.Authorization = token;
    }

    return request;
  });

  return liferayAxios;
};
