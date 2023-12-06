import OpenAI  from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function (req, res) {

    let start = new Date().getTime();

    const debug = req.body.debugMode;
    let userlist = req.body.csvoutput;

    if(debug) console.log(userlist);

    for(let i=0;i<userlist.length;i++){
        delete userlist[i].imageFile; //TODO
    }

    if(debug) console.log(userlist);

    const axios = require("axios");
    const fs = require("fs");

    const usernamePasswordBuffer = Buffer.from( 
        process.env.LIFERAY_ADMIN_EMAIL_ADDRESS + 
        ':' + process.env.LIFERAY_ADMIN_PASSWORD);

    const base64data = usernamePasswordBuffer.toString('base64');

    let userApiPath = process.env.LIFERAY_PATH + "/o/headless-admin-user/v1.0/user-accounts/batch";

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
        const response = await axios.post(userApiPath,
            JSON.stringify(userlist), options);

        if(debug) console.log(response.data);
    }
    catch (error) {
        console.log(error);
    }
    
    let end = new Date().getTime();

    res.status(200).json({ result: "Completed in " + (end - start) + " milliseconds"});
}