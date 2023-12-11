import OpenAI  from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function (req, res) {

    let start = new Date().getTime();

    const debug = req.body.debugMode;

    const userSchema = {
        type: "object",
        properties: {
          users: {
            type: "array",
            description: "An array of "+req.body.userNumber+" example users that will be added to the portal for demonstration",
            items:{
              type:"object",
              properties:{
                birthDate:{
                  type: "string",
                  description: "The user's birthday. It needs to be supplied in the format YYYY-MM-DD"
                },
                familyName:{
                  type: "string",
                  description: "The user's last name"
                },
                givenName:{
                  type: "string",
                  description: "The user's first name"
                },
                middleName:{
                  type: "string",
                  description: "This is the user's middle name."
                },
                jobTitle:{
                  type: "string",
                  description: "The user's job title."
                }
              },
              required: [ "birthDate", "familyName", "givenName", "middlelName", "jobTitle"]
            },
            required: ["users"]
          }
        }
      }

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {"role": "system", "content": "You are a system administrator responsible for adding users to a portal."},
            {"role": "user", "content": "Create a list of example users to be added to the portal for demonstration. Return only the result of the get_users function."}
        ],
        functions: [
            {name: "get_users", "parameters": userSchema}
        ],
        temperature: 0.6,
    });

    let userlist = JSON.parse(response.choices[0].message.function_call.arguments).users;
    
    for(let i=0;i<userlist.length;i++){
        userlist[i].additionalName = userlist[i].middleName;
        delete userlist[i].middleName;
        userlist[i].alternateName = userlist[i].givenName+"."+userlist[i].familyName;
        userlist[i].emailAddress = userlist[i].givenName+"."+userlist[i].familyName+"@"+req.body.emailPrefix;
    }

    if(debug) console.log(userlist);

    const axios = require("axios");
    const fs = require("fs");

    const usernamePasswordBuffer = Buffer.from( 
        process.env.LIFERAY_ADMIN_EMAIL_ADDRESS + 
        ':' + process.env.LIFERAY_ADMIN_PASSWORD);

    const base64data = usernamePasswordBuffer.toString('base64');

    let userApiPath = process.env.LIFERAY_PATH + "/o/headless-admin-user/v1.0/user-accounts";

    const options = {
        method: "POST",
        port: 443,
        headers: {
            'Authorization': 'Basic ' + base64data,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    };

    for(let i=0;i<userlist.length;i++){
      try {
          const response = await axios.post(userApiPath,
              userlist[i], options);

          if(debug) console.log("Created user:"+response.data.id+", "+response.data.alternateName);
      }
      catch (error) {
          console.log(error.code);
      }
    }
      
    let end = new Date().getTime();

    res.status(200).json({ result: "Completed in " + (end - start) + " milliseconds"});
}