import OpenAI  from "openai";

var functions = require('../utils/functions');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function (req, res) {

  const runCount = req.body.blogNumber;
  const debug = req.body.debugMode;
  const imageGeneration = req.body.imageGeneration;

  if(debug) console.log("requesting " + runCount + " blog(s)");
  if(debug) console.log("include images: " + imageGeneration);

  const runCountMax = 10;

  let blogJson, response;
  const blogContentSet = [];

  const schema = {
    type: "object",
    properties: {
      headline: {
        type: "string",
        description: "The title of the blog artcile."
      },
      alternativeHeadline: {
        type: "string",
        description: "A headline that is a summary of the blog article"
      },
      articleBody: {
        type: "string",
        description: "The content of the blog article needs to be "+req.body.blogLength+" words or more. Remove any double quotes",
      },
      picture_description: {
        type: "string",
        description: "A description of an appropriate image for this blog in three sentences."
      }
    },
    required: ["headline", "alternativeHeadline", "articleBody", "picture_description"]
  }

  for(let i=0; i<runCount; i++){

    response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {"role": "system", "content": "You are a blog author."},
        {"role": "user", "content": "Write blogs on the subject of: "+req.body.blogTopic+". It is important that each blog article's content is "+req.body.blogLength+" words or more."}
      ],
      functions: [
        {name: "get_blog_content", "parameters": schema}
      ],
      function_call: {name: "get_blog_content"},
      max_tokens: 1000,
      temperature: 0.8,
      frequency_penalty: 0.6,
      presence_penalty: 0
    });
    
    if(debug) console.log(response.choices[0].message.function_call.arguments);
    blogJson = JSON.parse(response.choices[0].message.function_call.arguments);

    let pictureDescription = blogJson.picture_description;
    delete blogJson.picture_description;

    if(req.body.imageStyle){
      pictureDescription = "Create an image in the style of " + req.body.imageStyle + ". "+ pictureDescription;
    }

    blogJson.articleBody = blogJson.articleBody.replace(/(?:\r\n|\r|\n)/g, '<br>');

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
        const timestamp = new Date().getTime();
        const file = fs.createWriteStream("generatedimages/img"+timestamp+"-"+i+".jpg");

        console.log("In Exports, getGeneratedImage:"+imageResponse);

        const http = require('https'); 

        http.get(imageResponse.data[0].url, function(response) {
          response.pipe(file);

          file.on("finish", () => {
            file.close();
            postImageToLiferay(file, req, blogJson, debug);
          });
  
        });

      } else {
        postBlogToLiferay(req, blogJson, 0, debug);
      }

    } catch (error) {
      if (error.response) {
        console.log(error.response.status);
      } else {
        console.log(error.message);
      }
    }

    blogContentSet.push(blogJson);

    if(i>=runCountMax)break;
  }
  
  res.status(200).json({ result: JSON.stringify(blogContentSet) });
}

function postImageToLiferay(file, req, blogJson, debug){

  const request = require('request');
  const fs = require('fs');

  let blogImageApiPath = process.env.LIFERAY_PATH + "/o/headless-delivery/v1.0/sites/"+req.body.siteId+"/blog-posting-images";
      
  if(debug) console.log(blogImageApiPath);

  let fileStream = fs.createReadStream(process.cwd()+"/"+file.path);
  const options = functions.getFilePostOptions(blogImageApiPath, fileStream, "file");
  
  setTimeout(function(){

    request(options, function (err, res, body) {
        if(err) console.log(err);
        
        postBlogToLiferay(req, blogJson, JSON.parse(body).id, debug)

    });

  },100);
}

async function postBlogToLiferay(req, blogJson,imageId, debug){

  if(imageId){
    blogJson.image = {
      "imageId": imageId
    }
  }

  const axios = require("axios");

  let apiPath = process.env.LIFERAY_PATH + "/o/headless-delivery/v1.0/sites/"+req.body.siteId+"/blog-postings";

  let options = functions.getAPIOptions("POST","en-US");

  try {
      const response = await axios.post(apiPath, blogJson, options);

      if(debug) console.log(response.data);
      if(debug) console.log("Blog Import Process Complete.");

  }
  catch (error) {
      console.log(error);
  }

}