import OpenAI  from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function (req, res) {

    let start = new Date().getTime();

    const debug = req.body.debugMode;
    let aiRole = req.body.aiRole;
    let aiRequest = req.body.aiRequest;
    let aiEndpoint = req.body.aiEndpoint;
    let objectFields = req.body.objectFields;

    let requiredList = [];
    for(let i = 0; i < objectFields.length; i++){
      requiredList.push(objectFields[i].fieldName);
    }

    const objectSchema = {
        type: "object",
        properties: {
          resultlist: {
            type: "array",
            description: aiRequest,
            items:{
              type:"object",
              properties:objectFields,
              required: requiredList
            },
            required: ["list"]
          }
        }
      }

    if(debug)console.log(objectSchema);

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {"role": "system", "content": aiRole},
            {"role": "user", "content": aiRequest}
        ],
        functions: [
        {name: "get_objects", "parameters": objectSchema}
        ],
        temperature: 0.6,
    });

    let resultlist = JSON.parse(response.choices[0].message.function_call.arguments).resultlist;
    if(debug) console.log(JSON.stringify(resultlist));

    const axios = require("axios");
    const fs = require("fs");

    const usernamePasswordBuffer = Buffer.from( 
        process.env.LIFERAY_ADMIN_EMAIL_ADDRESS + 
        ':' + process.env.LIFERAY_ADMIN_PASSWORD);

    const base64data = usernamePasswordBuffer.toString('base64');

    let objectApiPath = process.env.LIFERAY_PATH + aiEndpoint;

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
        const response = await axios.post(objectApiPath,
          resultlist, options);

        if(debug) console.log(response.data);
    }
    catch (error) {
        console.log(error);
    }

    let end = new Date().getTime();

    res.status(200).json({ result: "Completed in " + (end - start) + " milliseconds"});
}