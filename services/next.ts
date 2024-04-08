import axios from 'axios';
import Cookies from 'universal-cookie';

import { APP_CONFIG } from '../components/layout/footer';

const nextAxios = axios.create();

nextAxios.interceptors.request.use((request) => {
  const cookies = new Cookies();

  if (request.data) {
    request.data.config = cookies.get(APP_CONFIG);
  }

  return request;
});

export default nextAxios;
