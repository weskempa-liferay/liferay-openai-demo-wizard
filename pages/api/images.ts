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
      const timestamp = new Date().getTime();
      const file = fs.createWriteStream("generatedimages/img"+timestamp+"-"+i+".jpg");

      console.log("In Exports, getGeneratedImage:"+imageResponse);

      const http = require('https'); 

      http.get(imageResponse.data[0].url, function(response) {
        response.pipe(file);

        file.on("finish", () => {
          file.close();
          postImageToLiferay(file,req, debug);
        });

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

function postImageToLiferay(file,req, debug){

  const imageFolderId = parseInt(req.body.imageFolderId);

  const request = require('request');
  const fs = require('fs');

  let imageApiPath = process.env.LIFERAY_PATH + "/o/headless-delivery/v1.0/sites/"+req.body.siteId+"/documents";

  if(imageFolderId){
    imageApiPath = process.env.LIFERAY_PATH + "/o/headless-delivery/v1.0/document-folders/"+imageFolderId+"/documents";
  }
      
  if(debug) console.log(imageApiPath);

  let fileStream = fs.createReadStream(process.cwd()+"/"+file.path);
  const options = functions.getFilePostOptions(imageApiPath,fileStream);
  
  setTimeout(function(){

    request(options, function (err, res, body) {
      if(err) console.log(err);
        
      if(debug) console.log(res);
    });

  },100);
}