import OpenAI  from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function (req, res) {

  console.log("requesting " + req.body.blogNumber + " blogs");
  const runCount = req.body.blogNumber;
  const runCountMax = 10;

  let blogJson, blogResponse, response;
  const axios = require("axios");
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
        description: "A description of an appropriate image for this blog in six sentences."
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

    //console.log(response.choices[0].message.function_call.arguments);
    //console.log(JSON.parse(response.choices[0].message.function_call.arguments));
  
    blogJson = JSON.parse(response.choices[0].message.function_call.arguments);

    let pictureDescription = blogJson.picture_description;
    delete blogJson.picture_description;

    blogJson.articleBody = blogJson.articleBody.replace(/(?:\r\n|\r|\n)/g, '<br>');

    //console.log("pictureDescription" + pictureDescription)

    blogContentSet.push(blogJson);

    if(i>=runCountMax)break;
  }

  console.log(blogContentSet);
  console.log(JSON.stringify(blogContentSet));

  try {
    let apiPath = process.env.LIFERAY_PATH + "/o/headless-delivery/v1.0/sites/"+req.body.siteId+"/blog-postings/batch";

    blogResponse = await axios.post(apiPath, blogContentSet, headerObj);
  }
  catch(apiError) {
    console.log("error creating prblogoduct " + req.body.blogTopic + " -- " + apiError);
  }

  res.status(200).json({ result: JSON.stringify(blogContentSet) });
}
