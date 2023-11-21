import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {

  console.log("requesting " + req.body.blogNumber + " blogs");
  const runCount = req.body.blogNumber;
  const runCountMax = 10;

  let completion;
  let blogJson, apiPath, blogResponse;
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

  for(let i=0; i<runCount; i++){
    completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: reviewPrompt(req.body.blogTopic),
      max_tokens: 1000,
      temperature: 0.8,
      top_p: 1.0,
      frequency_penalty: 0.5,
      presence_penalty: 0.0
    });

    blogJson = JSON.parse(completion.data.choices[0].text);
    blogContentSet.push(blogJson);

    if(i=>runCountMax)break;
  }

  console.log(blogContentSet);

    try {
      apiPath = process.env.LIFERAY_PATH + "/o/headless-delivery/v1.0/sites/"+req.body.siteId+"/blog-postings/batch";

      blogResponse = await axios.post(apiPath, blogContentSet, headerObj);
    }
    catch(apiError) {
      console.log("error creating prblogoduct " + req.body.blogTopic + " -- " + apiError);
    }

  res.status(200).json({ result: JSON.stringify(blogContentSet) });
}

function reviewPrompt(productName) {
  return `Topic: Breakfast
  json blog post: {
    "alternativeHeadline": "Sarah enjoyed a peaceful breakfast as a comforting ritual.",
    "articleBody": "As the morning sun painted the kitchen in warm hues, Sarah savored the simple joy of breakfast – the aroma of freshly brewed coffee and the crisp sound of bacon sizzling in the pan. Amidst the routine, she found a moment of serenity, a daily ritual that turned ordinary mornings into a comforting embrace of flavors and quiet reflection.",
    "headline": "Sarah' Breakfast Ritual"
  }
  Topic: ${productName}
  json blog post:`;
}







