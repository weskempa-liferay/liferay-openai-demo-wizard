export default async function (req, res) {

    const testFolder = process.cwd()+"/public/images/art-styles/";
    const fs = require('fs');

    console.log(testFolder);

    let styleList = [];

    fs.readdir(testFolder, (err, files) => {
        files.forEach(file => {
            console.log(file);
            console.log(file.startsWith('style'));
            if(file.startsWith('style'))
                styleList.push(file);
            
        });
        
        res.status(200).json({ result: JSON.stringify(styleList) });
    });
  
}