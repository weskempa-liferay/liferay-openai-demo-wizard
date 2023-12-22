import OpenAI  from "openai";

var functions = require('../utils/functions');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function (req, res) {

    let start = new Date().getTime();

    const debug = req.body.debugMode;

    const accountSchema = {
        type: "object",
        properties: {
          accounts: {
            type: "array",
            description: "An array of "+req.body.accountNumber+" business accounts",
            items:{
              type:"object",
              properties:{
                name:{
                  type: "string",
                  description: "Name of the business."
                }
              },
              required: ["name"]
            },
            required: ["accounts"]
          }
        }
      }

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {"role": "system", "content": "You are an account manager responsible for listed the active acccounts for your company."},
            {"role": "user", "content": "Create a list of active acccounts for a company that provides "+req.body.accountTopic}
        ],
        functions: [
        {name: "get_accounts", "parameters": accountSchema}
        ],
        temperature: 0.6,
    });

    let accounts = JSON.parse(response.choices[0].message.function_call.arguments).accounts;
    if(debug) console.log(JSON.stringify(accounts));

    for(let i=0;i<accounts.length;i++){
        if(debug) console.log(accounts[i]);
        
        let postBody = {
          "name": accounts[i].name,
          "externalReferenceCode": accounts[i].name.replaceAll(" ","-").toLowerCase(),
          "type": 2
        };

        const axios = require("axios");

        let faqApiPath = process.env.LIFERAY_PATH + "/o/headless-commerce-admin-account/v1.0/accounts";

        const options = {
            method: "POST",
            port: 443,
            headers: {
                'Authorization': 'Basic ' + functions.getBase64data(),
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