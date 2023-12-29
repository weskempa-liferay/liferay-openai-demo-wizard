export default async function Action(req, res) {
  const folder = process.cwd() + '/public/images/art-styles/';
  const fs = require('fs');

  let styleList = [];

  fs.readdir(folder, (err, files) => {
    files.forEach((file) => {
      if (file.startsWith('style')) styleList.push(file);
    });

    res.status(200).json({ result: JSON.stringify(styleList) });
  });
}
