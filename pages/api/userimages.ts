import fs from 'fs';

export default async function Action(req, res) {
  const folder = process.cwd() + '/public/users/user-images/';

  let styleList = [];

  fs.readdir(folder, (err, files) => {
    files.forEach((file) => {
      if (file.startsWith(req.body.gender)) styleList.push(file);
    });

    res.status(200).json({ result: styleList[req.body.index % 6] });
  });
}
