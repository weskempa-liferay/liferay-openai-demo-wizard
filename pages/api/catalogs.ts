import { NextApiRequest, NextApiResponse } from "next";

import { axiosInstance } from "../../services/liferay";

export default async function Action(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const axios = axiosInstance(req, res);

  const { data } = await axios.get(
    "/o/headless-commerce-admin-catalog/v1.0/catalogs",
  );

  res.status(200).json(data.items);
}
