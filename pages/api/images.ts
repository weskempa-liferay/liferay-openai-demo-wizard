import OpenAI  from "openai";

var functions = require('../utils/functions');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function (req, res) {

  let start = new Date().getTime();

  const debug = req.body.debugMode;
  const runCount = req.body.imageNumber;
  const imageDescription = req.body.imageDescription;
  const imageGeneration = req.body.imageGeneration;

  if(debug) console.log("requesting " + runCount + " images");
  if(debug) console.log("include images: " + imageGeneration + " " +imageDescription);

  const runCountMax = 10;
  const timestamp = new Date().getTime();
  const base64data = functions.getBase64data();

  let pictureDescription = imageDescription;

  for(let i=0; i<runCount; i++){

    if(req.body.imageStyle){
      pictureDescription = "Create an image in the style of " + req.body.imageStyle + ". "+ imageDescription;
    }

    if(debug) console.log("pictureDescription: " + pictureDescription)
  
    try {

      const imageResponse = await openai.images.generate({
        model: imageGeneration,
        prompt: pictureDescription,
        n: 1,
        size: "1024x1024"});
  
      if(debug) console.log(imageResponse.data[0].url);

      const fs = require('fs');
      const http = require('https'); 
      
      const file = fs.createWriteStream("generatedimages/img"+timestamp+"-"+i+".jpg");

      const request = http.get(imageResponse.data[0].url, function(response) {
        response.pipe(file);

        file.on("finish", () => {
          file.close();
          if(debug) console.log("Download Completed");
          postImageToLiferay(file,base64data,req, debug);
        });
  
        if(debug) console.log("upload image " + file.path );
      });

    } catch (error) {
      if (error.response) {
        console.log(error.response.status);
      } else {
        console.log(error.message);
      }
    }

    if(i>=runCountMax)break;
  }
  
  let end = new Date().getTime();

  if(debug) console.log("Completed in " + (end - start) + " milliseconds");

  res.status(200).json({ result: "Completed in " +
    functions.millisToMinutesAndSeconds(end - start)});
}

function postImageToLiferay(file,base64data,req, debug){

  const imageFolderId = parseInt(req.body.imageFolderId);

  const fs = require('fs');
  const request = require('request');

  let imageApiPath = process.env.LIFERAY_PATH + "/o/headless-delivery/v1.0/sites/"+req.body.siteId+"/documents";

  if(imageFolderId){
    imageApiPath = process.env.LIFERAY_PATH + "/o/headless-delivery/v1.0/document-folders/"+imageFolderId+"/documents";
  }
      
  if(debug) console.log(imageApiPath);

  const options = functions.getFilePostOptions(imageApiPath,fs.createReadStream(process.cwd()+"/"+file.path));
  
  setTimeout(function(){

    request(options, function (err, res, body) {
      if(err) console.log(err);
        
      if(debug) console.log(res);
    });

  },100);
}