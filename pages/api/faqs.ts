import OpenAI  from "openai";

var functions = require('../utils/functions');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function (req, res) {

    let start = new Date().getTime();

    const debug = req.body.debugMode;

    const faqSchema = {
        type: "object",
        properties: {
          faqs: {
            type: "array",
            description: "An array of "+req.body.faqNumber+" frequently asked questions",
            items:{
              type:"object",
              properties:{
                title:{
                  type: "string",
                  description: "Frequently asked question"
                },
                answer:{
                  type: "string",
                  description: "Answer to the frequently asked question. Answers over 30 words are preferred."
                }
              },
              required: ["title", "question", "answer"]
            },
            required: ["faqs"]
          }
        }
      }

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {"role": "system", "content": "You are an administrator responsible for defining frequently asked questions."},
            {"role": "user", "content": "Create a list of frequently asked questions and answers on the subject of: "+req.body.faqTopic}
        ],
        functions: [
        {name: "get_faqs", "parameters": faqSchema}
        ],
        temperature: 0.6,
    });

    let faqs = JSON.parse(response.choices[0].message.function_call.arguments).faqs;
    if(debug) console.log(JSON.stringify(faqs));

    for(let i=0;i<faqs.length;i++){
        if(debug) console.log(faqs[i]);
        
        let postBody = {
            "contentFields": [
              {
                  "contentFieldValue": {
                  "data": faqs[i].answer
                  },
                  "name": "Answer"
              }
            ],
            "contentStructureId": req.body.structureId,
            "siteId": req.body.siteId,
            "structuredContentFolderId": req.body.folderId,
            "taxonomyCategoryIds": returnArraySet(req.body.categoryIds),
            "title": faqs[i].title
        };

        const axios = require("axios");

        const usernamePasswordBuffer = Buffer.from( 
            process.env.LIFERAY_ADMIN_EMAIL_ADDRESS + 
            ':' + process.env.LIFERAY_ADMIN_PASSWORD);

        const base64data = usernamePasswordBuffer.toString('base64');

        let faqApiPath = process.env.LIFERAY_PATH + "/o/headless-delivery/v1.0/sites/"+req.body.siteId+"/structured-contents";

        const options = {
            method: "POST",
            port: 443,
            headers: {
                'Authorization': 'Basic ' + base64data,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };

        try {
            const response = await axios.post(faqApiPath,
                postBody, options);

            if(debug) console.log(response.data);
        }
        catch (error) {
            console.log(error);
        }

    }

    let end = new Date().getTime();

    res.status(200).json({ result: "Completed in " +
      functions.millisToMinutesAndSeconds(end - start)});
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