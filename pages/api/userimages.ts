import fs from 'fs';

export default async function UserImagesAction(req, res) {
  const folder = process.cwd() + '/public/users/user-images/';

  let imgList = [];

  fs.readdir(folder, (err, files) => {
    files.forEach((file) => {
      if (file.startsWith(req.body.gender)) imgList.push(file);
    });

    res.status(200).json({ result: imgList[req.body.index % 6] });
  });
}
