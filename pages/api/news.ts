import OpenAI  from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function (req, res) {

  let start = new Date().getTime();

  const debug = req.body.debugMode;
  const runCount = req.body.newsNumber;
  const imageGeneration = req.body.imageGeneration;

  if(debug) console.log("requesting " + runCount + " news articles");
  if(debug) console.log("include images: " + imageGeneration);

  const runCountMax = 10;
  const timestamp = new Date().getTime();

  let newsJson, response;
  const newsContentSet = [];

  const usernamePasswordBuffer = Buffer.from( 
    process.env.LIFERAY_ADMIN_EMAIL_ADDRESS + 
    ':' + process.env.LIFERAY_ADMIN_PASSWORD);

  const base64data = usernamePasswordBuffer.toString('base64');

  const schema = {
    type: "object",
    properties: {
      headline: {
        type: "string",
        description: "The title of the news artcile"
      },
      alternativeHeadline: {
        type: "string",
        description: "A headline that is a summary of the news article"
      },
      articleBody: {
        type: "string",
        description: "The content of the news article which should be "+req.body.newsLength+" words or more.  Remove any double quotes",
      },
      picture_description: {
        type: "string",
        description: "A description of an appropriate image for this news in three sentences."
      }
    },
    required: ["headline", "alternativeHeadline", "articleBody", "picture_description"]
  }

  for(let i=0; i<runCount; i++){

    response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {"role": "system", "content": "You are a news author."},
        {"role": "user", "content": "Write news on the subject of: "+req.body.newsTopic+". Each news title needs to be unique. The content of the news article which should be "+req.body.newsLength+" words or more."}
      ],
      functions: [
        {name: "get_news_content", "parameters": schema}
      ],
      function_call: {name: "get_news_content"},
      max_tokens: 1000,
      temperature: 0.8,
      frequency_penalty: 0.5,
      presence_penalty: 0
    });
    
    if(debug) console.log(response.choices[0].message.function_call.arguments);
    newsJson = JSON.parse(response.choices[0].message.function_call.arguments);

    let pictureDescription = newsJson.picture_description;
    delete newsJson.picture_description;

    newsJson.articleBody = newsJson.articleBody.replace(/(?:\r\n|\r|\n)/g, '<br>');

    if(debug) console.log("pictureDescription: " + pictureDescription)
  
    try {
      
      if(imageGeneration!="none"){
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
            postImageToLiferay(file,base64data,req, newsJson, debug);
          });
    
          if(debug) console.log("upload image " + file.path );
        });

    } else {
      postNewsToLiferay(base64data,req, newsJson, 0, debug);
    }

    } catch (error) {
      if (error.response) {
        console.log(error.response.status);
      } else {
        console.log(error.message);
      }
    }

    newsContentSet.push(newsJson);

    if(i>=runCountMax)break;
  }
  
  let end = new Date().getTime();

  console.log("Completed in " + (end - start) + " milliseconds");

  res.status(200).json({ result: JSON.stringify(newsContentSet) });
}

function postImageToLiferay(file,base64data,req, newsJson, debug){

  const fs = require('fs');
  const request = require('request');

  let newsImageApiPath = process.env.LIFERAY_PATH + "/o/headless-delivery/v1.0/sites/"+req.body.siteId+"/documents";
      
  if(debug) console.log(newsImageApiPath);

  const options = {
      method: "POST",
      url: newsImageApiPath,
      port: 443,
      headers: {
        'Authorization': 'Basic ' + base64data, 
        'Content-Type': 'multipart/form-data'
      },
      formData : {
          "file" : fs.createReadStream(process.cwd()+"/"+file.path)
      }
  };
  
  setTimeout(function(){

    request(options, function (err, res, body) {
        if(err) console.log(err);
        
        postNewsToLiferay(base64data,req, newsJson, JSON.parse(body).id, debug);

    });

  },100);
}

function postNewsToLiferay(base64data,req, newsJson,imageId, debug){

  let newsFields;
  
  if(imageId){
    newsFields = [
      {
        "contentFieldValue": {
          "data": newsJson.alternativeHeadline
        },
        "name": "Headline"
      },
      {
        "contentFieldValue": {
          "data": newsJson.articleBody
        },
        "name": "Content"
      },
      {
        "contentFieldValue": {
          "image": {
            "id": imageId
          }
        },
        "name": "Image"
      }
    ];
  } else {
    newsFields = [
      {
        "contentFieldValue": {
          "data": newsJson.alternativeHeadline
        },
        "name": "Headline"
      },
      {
        "contentFieldValue": {
          "data": newsJson.articleBody
        },
        "name": "Content"
      }
    ];
  }

  const newsSchema = {
    "contentFields": newsFields,
    "contentStructureId": req.body.structureId,
    "structuredContentFolderId": req.body.folderId,
    "title": newsJson.headline
  }

  let apiPath = process.env.LIFERAY_PATH + "/o/headless-delivery/v1.0/sites/"+req.body.siteId+"/structured-contents";

  const options = {
      method: "POST",
      url: apiPath,
      port: 443,
      headers: {
        'Authorization': 'Basic ' + base64data,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newsSchema)
  };

  setTimeout(function(){{

    const request = require('request');

    request(options, function (err, res, body) {
        if(err) console.log(err);

        console.log("News import process complete.");
    });

  }},100);

}