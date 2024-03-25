import fs from "fs";
import { promisify } from "util";

const readdir = promisify(fs.readdir);

export async function getImageList(gender: string) {
  try {
    const folder = process.cwd() + "/public/users/user-images/";
    const files = await readdir(folder);

    const imgList = files.filter((file) => file.startsWith(gender));

    return imgList;
  } catch (error) {
    throw error;
  }
}

export default async function UserImagesAction(req, res) {
  const images = await getImageList(req.query.gender);

  res.status(200).json({ result: images });
}
