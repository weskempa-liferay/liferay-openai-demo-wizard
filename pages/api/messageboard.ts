import OpenAI  from "openai";

var functions = require('../utils/functions');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const axios = require("axios");

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

export default async function (req, res) {

  let start = new Date().getTime();

  const debug = req.body.debugMode;

  if(debug) console.log("mbSectionNumber:"+req.body.mbSectionNumber + ", mbThreadNumber:"+req.body.mbThreadNumber + ", mbMessageNumber:"+req.body.mbMessageNumber);

  const messageBoardSchema = {
    type: "object",
    properties: {
      categories: {
        type: "array",
        description: "An array of "+req.body.mbSectionNumber+" or more message board categories related to the given topic",
        items:{
          type:"object",
          properties:{
            category:{
              type: "string",
              description: "Name of the message board category"
            },
            threads: {
              type:"array",
              description: "An array of "+req.body.mbThreadNumber+" message board threads within the category",
              items:{
                type:"object",
                properties:{
                  headline: {
                    type: "string",
                    description: "The title of the message board thread"
                  },
                  articleBody: {
                    type: "string",
                    description: "The full message as seen in the message board thread body. Use "+req.body.mbThreadLength+" words or more."
                  },
                  messages: {
                    type: "array",
                    description: "An array of "+req.body.mbMessageNumber+" message board messages within the category",
                    items: {
                      type:"object",
                      properties:{
                        message: {
                            type: "string",
                            description: "The message that relates to the message board threads"
                        }
                      }
                    },
                    required: ["messages"]
                  }
                }
              },
              required: ["headline","articleBody","threads"]
            }
          }
        },
        required: ["categories"]
      }
    }
  }

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {"role": "system", "content": "You are a message board administrator responsible for managing the message board for your company."},
      {"role": "user", "content": "Create a list of message board categories, threads, and messages on the subject of '" + 
            req.body.mbTopic +  "'. It is important to include " +
            req.body.mbSectionNumber + " or more message board categories, " + 
            req.body.mbThreadNumber + " message board threads in each category, and " +
            req.body.mbMessageNumber + " message board threads in each thread. " +
            "Each message board thread should be " + req.body.mbThreadLength+" words or more." }
    ],
    functions: [
      {name: "get_message_board_content", "parameters": messageBoardSchema}
    ],
    temperature: 0.6,
  });

  let categories = JSON.parse(response.choices[0].message.function_call.arguments).categories;
  if(debug) console.log(JSON.stringify(categories));
  
  for(let i = 0; categories.length>i; i++){  

    let sectionApiPath = process.env.LIFERAY_PATH + "/o/headless-delivery/v1.0/sites/"+req.body.siteId+"/message-board-sections";

    if(debug) console.log(sectionApiPath);

    let mbSectionJson = {
        "title": categories[i].category
    }

    let mbSectionResponse = await axios.post(sectionApiPath, mbSectionJson, headerObj);
    let sectionId = mbSectionResponse.data.id;

    if(debug) console.log("C:" + categories[i].category + " created with id " + sectionId);

    let threads = categories[i].threads;

    for(let t=0; t<threads.length; t++){

        let threadApiPath = process.env.LIFERAY_PATH + "/o/headless-delivery/v1.0/message-board-sections/" + sectionId + "/message-board-threads";

        if(debug) console.log(threadApiPath);

        let mbThreadJson = {
            "headline": threads[t].headline, 
            "articleBody": threads[t].articleBody
        }

        let mbThreadResponse = await axios.post(threadApiPath, mbThreadJson, headerObj);
        let threadId = mbThreadResponse.data.id;

        if(debug) console.log("T:" + threads[t].headline + " created with id " + threadId);

        let messages = threads[t].messages;
        for(let m=0; m<messages.length; m++){

            let messageApiPath = process.env.LIFERAY_PATH + "/o/headless-delivery/v1.0/message-board-threads/"+threadId+"/message-board-messages";

            if(debug) console.log(messageApiPath);
    
            let mbMessageJson = {
                "articleBody": messages[m].message
            }
    
            let mbMessageThreadResponse = await axios.post(messageApiPath, mbMessageJson, headerObj);
            let messageId = mbMessageThreadResponse.data.id;
    
            if(debug) console.log("M:" + messages[m].message + " created with id " + messageId);

        }
    }
    
  }
  
  let end = new Date().getTime();
  res.status(200).json({result:"Completed in " +
    functions.millisToMinutesAndSeconds(end - start)});
    
}