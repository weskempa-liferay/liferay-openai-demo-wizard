import OpenAI  from "openai";

var functions = require('../utils/functions');

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

  const storedProperties = {
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
  }

  let requiredFields = ["headline", "alternativeHeadline", "articleBody", "picture_description"];
  let languages = req.body.languages;

  if(req.body.manageLanguage){

    for(let i = 0; i < languages.length; i++){
      
      storedProperties["headline_" + languages[i]] = {
        type: "string",
        description: "The title of the news artcile translated into " + functions.getLanguageDisplayName(languages[i])
      };
      requiredFields.push("headline_" + languages[i]);

      storedProperties["alternativeHeadline_" + languages[i]] = {
        type: "string",
        description: "A headline that is a summary of the news article translated into " + functions.getLanguageDisplayName(languages[i])
      };
      requiredFields.push("alternativeHeadline_" + languages[i]);

      storedProperties["articleBody_" + languages[i]] = {
        type: "string",
        description: "The content of the news article translated into " + functions.getLanguageDisplayName(languages[i])
      };
      requiredFields.push("articleBody_" + languages[i]);

    }
  }

  const newsSchema = {
    type: "object",
    properties: storedProperties,
    required: requiredFields
  }

  for(let i=0; i<runCount; i++){

    response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {"role": "system", "content": "You are a news author."},
        {"role": "user", "content": "Write news on the subject of: "+req.body.newsTopic+". Each news title needs to be unique. The content of the news article which should be "+req.body.newsLength+" words or more."}
      ],
      functions: [
        {name: "get_news_content", "parameters": newsSchema}
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

    if(req.body.imageStyle){
      pictureDescription = "Create an image in the style of " + req.body.imageStyle + ". "+ pictureDescription;
    }

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

  res.status(200).json({ result: "Completed in " +
    functions.millisToMinutesAndSeconds(end - start)});
}

function postImageToLiferay(file,base64data,req, newsJson, debug){

  const imageFolderId = parseInt(req.body.imageFolderId);

  const fs = require('fs');
  const request = require('request');

  let newsImageApiPath = process.env.LIFERAY_PATH + "/o/headless-delivery/v1.0/sites/"+req.body.siteId+"/documents";

  if(imageFolderId){
    newsImageApiPath = process.env.LIFERAY_PATH + "/o/headless-delivery/v1.0/document-folders/"+imageFolderId+"/documents";
  }
      
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

  let titleValues = {};

  if(req.body.manageLanguage){

    let alternativeHeadlineFieldValues = {};
    let articleBodyFieldValues = {};
    let imageValues = {};

    for(let l = 0; l < req.body.languages.length; l++){

      imageValues[req.body.languages[l]] = {
        data:""
      }

      alternativeHeadlineFieldValues = {};
      articleBodyFieldValues = {};
      titleValues = {};
      
        for (const [key, value] of Object.entries(newsJson)) {

          try{

            if(debug) console.log(`${l} : ${key} : ${value}`);

            if(key.indexOf("_")>0){
              let keySplit=key.split("_");
              
              if(keySplit[0]=="headline")
                titleValues[keySplit[1]] = value;
              
              if(keySplit[0]=="alternativeHeadline")
                alternativeHeadlineFieldValues[keySplit[1]] = { "data":value };
          
              if(keySplit[0]=="articleBody")
                articleBodyFieldValues[keySplit[1]] = { "data":value };
            }

          } catch (error){
            if(debug) console.log("unable to process translation for faq " + l + " : " + req.body.languages[l]);
            if(debug) console.log(error);
          }

        }
    }

    newsFields[0]["contentFieldValue_i18n"]=alternativeHeadlineFieldValues;
    newsFields[1]["contentFieldValue_i18n"]=articleBodyFieldValues;

    newsFields.push({
      "contentFieldValue": {
        "data": ""
      },
      "name": "Image",
      "contentFieldValue_i18n": imageValues
    })

  }

  const newsSchema = {
    "contentFields": newsFields,
    "contentStructureId": req.body.structureId,
    "structuredContentFolderId": req.body.folderId,
    "taxonomyCategoryIds": returnArraySet(req.body.categoryIds),
    "title": newsJson.headline,
    "title_i18n":titleValues
  }

  let apiPath = process.env.LIFERAY_PATH + "/o/headless-delivery/v1.0/sites/"+req.body.siteId+"/structured-contents";

  const options = {
      method: "POST",
      url: apiPath,
      port: 443,
      headers: {
        'Authorization': 'Basic ' + base64data,
        'Content-Type': 'application/json',
        'Accept-Language': req.body.defaultLanguage,
      },
      body: JSON.stringify(newsSchema)
  };

  setTimeout(function(){{

    const request = require('request');

    request(options, function (err, res, body) {
        if(debug) console.log("res");
        if(debug) console.log(res);

        if(err) console.log(err);

        console.log("News import process complete.");
    });

  }},100);

}

function returnArraySet(value){
  if(value.indexOf(",")>-1){
    return value.split(",");
  } else if (parseInt(value)>0){
    return [value];
  } else {
    return [];
  }
}