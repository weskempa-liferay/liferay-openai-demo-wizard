import OpenAI  from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function (req, res) {

  const runCount = req.body.blogNumber;
  const includeImages = req.body.includeImages;

  console.log("requesting " + runCount + " blog(s)");
  console.log("include images: " + includeImages);

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
        description: "The content of the blog article. Remove any double quotes",
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
        {"role": "user", "content": "Write a blog on the subject of: "+req.body.blogTopic}
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
    
    console.log(response.choices[0].message.function_call.arguments);
    blogJson = JSON.parse(response.choices[0].message.function_call.arguments);

    let pictureDescription = blogJson.picture_description;
    delete blogJson.picture_description;

    blogJson.articleBody = blogJson.articleBody.replace(/(?:\r\n|\r|\n)/g, '<br>');

    console.log("pictureDescription: " + pictureDescription)

    try {
      
      const imageResponse = await openai.images.generate({
        prompt: pictureDescription,
        n: 1,
        size: "1024x1024"});
  
      console.log(imageResponse.data[0].url);

      const fs = require('fs');
      const http = require('https'); 
      
      const file = fs.createWriteStream("generatedimages/img"+timestamp+"-"+i+".jpg");

      const request = http.get(imageResponse.data[0].url, function(response) {
         response.pipe(file);

         file.on("finish", () => {
             file.close();
             console.log("Download Completed");
             //console.log(file);

             if(includeImages){

              postImageToLiferay(file,base64data,req, blogJson, i);
             }else{
              postBlogToLiferay(file,base64data,req, blogJson, i,0);
             }
         });
  
        console.log("upload image " + file.path );
        //console.log("Current directory:", __dirname);
      });

    } catch (error) {
      if (error.response) {
        console.log(error.response.status);
        //console.log(error.response.data);
      } else {
        console.log(error.message);
      }
    }

    blogContentSet.push(blogJson);

    if(i>=runCountMax)break;
  }
  
  res.status(200).json({ result: JSON.stringify(blogContentSet) });
}

function postImageToLiferay(file,base64data,req, blogJson, loopCount){

  const fs = require('fs');
  const request = require('request');

  let blogImageApiPath = process.env.LIFERAY_PATH + "/o/headless-delivery/v1.0/sites/"+req.body.siteId+"/blog-posting-images";
      
  console.log(blogImageApiPath);

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
        
        postBlogToLiferay(file,base64data,req, blogJson, loopCount,JSON.parse(body).id)

    });

  },100);
}

function postBlogToLiferay(file,base64data,req, blogJson, loopCount,imageId){

  //console.log(JSON.parse(body));

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
        //console.log(body);

        console.log("Blog Import Process Complete.");
    });

  }},100);

}