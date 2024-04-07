import { useEffect, useState } from 'react';

import nextAxios from '../services/next';

const useCatalogs = () => {
  const [catalogs, setCatalogs] = useState([]);

  useEffect(() => {
    nextAxios
      .get('/api/catalogs')
      .then((response) => setCatalogs(response.data))
      .catch((error) => {
        console.error('err', error);
      });
  }, []);

  return catalogs;
};

export default useCatalogs;
