import OpenAI  from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const debug = true;

export default async function (req, res) {

  const runCount = req.body.blogNumber;
  const includeImages = req.body.includeImages;

  if(debug) console.log("requesting " + runCount + " blog(s)");
  if(debug) console.log("include images: " + includeImages);

  const runCountMax = 10;
  const timestamp = new Date().getTime();

  let blogJson, response;
  const blogContentSet = [];

  const usernamePasswordBuffer = Buffer.from( 
    process.env.LIFERAY_ADMIN_EMAIL_ADDRESS + 
    ':' + process.env.LIFERAY_ADMIN_PASSWORD);

  const base64data = usernamePasswordBuffer.toString('base64');

  let headerObj = {
    headers: {
      'Authorization': 'Basic ' + base64data, 
      'Content-Type': 'application/json'
    }
  };

  const schema = {
    type: "object",
    properties: {
      headline: {
        type: "string",
        description: "The title of the blog artcile"
      },
      alternativeHeadline: {
        type: "string",
        description: "A headline that is a summary of the blog article"
      },
      articleBody: {
        type: "string",
        description: "The content of the blog article which should be "+req.body.blogLength+" words or more.  Remove any double quotes",
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
        {"role": "user", "content": "Write blogs on the subject of: "+req.body.blogTopic+". Each blog title needs to be unique."}
      ],
      functions: [
        {name: "get_blog_content", "parameters": schema}
      ],
      function_call: {name: "get_blog_content"},
      max_tokens: 1000,
      temperature: 0.8,
      frequency_penalty: 0.5,
      presence_penalty: 0
    });
    
    if(debug) console.log(response.choices[0].message.function_call.arguments);
    blogJson = JSON.parse(response.choices[0].message.function_call.arguments);

    let pictureDescription = blogJson.picture_description;
    delete blogJson.picture_description;

    blogJson.articleBody = blogJson.articleBody.replace(/(?:\r\n|\r|\n)/g, '<br>');

    if(debug) console.log("pictureDescription: " + pictureDescription)

    try {
      
      if(includeImages){
        const imageResponse = await openai.images.generate({
          model: "dall-e-3",
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
            postImageToLiferay(file,base64data,req, blogJson);
          });
  
        if(debug) console.log("upload image " + file.path );
      });

    } else {
      postBlogToLiferay(base64data,req, blogJson, 0);
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

function postImageToLiferay(file,base64data,req, blogJson){

  const fs = require('fs');
  const request = require('request');

  let blogImageApiPath = process.env.LIFERAY_PATH + "/o/headless-delivery/v1.0/sites/"+req.body.siteId+"/blog-posting-images";
      
  if(debug) console.log(blogImageApiPath);

  const options = {
      method: "POST",
      url: blogImageApiPath,
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
        
        postBlogToLiferay(base64data,req, blogJson, JSON.parse(body).id)

    });

  },100);
}

function postBlogToLiferay(base64data, req, blogJson,imageId){

  if(imageId){
    blogJson.image = {
      "imageId": imageId
    }
  }

  let apiPath = process.env.LIFERAY_PATH + "/o/headless-delivery/v1.0/sites/"+req.body.siteId+"/blog-postings";

  const options = {
      method: "POST",
      url: apiPath,
      port: 443,
      headers: {
        'Authorization': 'Basic ' + base64data,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(blogJson)
  };

  setTimeout(function(){{

    const request = require('request');

    request(options, function (err, res, body) {
        if(err) console.log(err);

        console.log("Blog Import Process Complete.");
    });

  }},100);

}