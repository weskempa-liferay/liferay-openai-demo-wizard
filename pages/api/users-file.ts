import OpenAI  from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function (req, res) {

    let start = new Date().getTime();

    const debug = req.body.debugMode;
    let userlist = req.body.csvoutput;

    if(debug) console.log(userlist);

    const axios = require("axios");
    const fs = require("fs");

    const usernamePasswordBuffer = Buffer.from( 
        process.env.LIFERAY_ADMIN_EMAIL_ADDRESS + 
        ':' + process.env.LIFERAY_ADMIN_PASSWORD);

    const base64data = usernamePasswordBuffer.toString('base64');

    let userApiPath = process.env.LIFERAY_PATH + "/o/headless-admin-user/v1.0/user-accounts";
    let userImagePath = "";

    for(let i=0;i<userlist.length;i++){
    
        userImagePath = userlist[i].imageFile;
        delete userlist[i].imageFile;

        console.log(userlist[i].emailAddress + ", userImagePath: " + userImagePath);

        try {

            let options = {
                method: "POST",
                port: 443,
                headers: {
                    'Authorization': 'Basic ' + base64data,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            };

            const response = await axios.post(userApiPath,
                JSON.stringify(userlist[i]), options);
    
            if(debug) console.log("Saved user: " + response.data.id);
          
            if(userImagePath.length>0){

                const fs = require('fs');
                const request = require('request');
                    
                let userImageApiPath = process.env.LIFERAY_PATH + "/o/headless-admin-user/v1.0/user-accounts/" + response.data.id + "/image";
                    
                if(debug) console.log(userImageApiPath);
                if(debug) console.log(process.cwd() + "/" + userImagePath);
                
                let imgoptions = {
                    method: "POST",
                    url: userImageApiPath,
                    port: 443,
                    headers: {
                    'Authorization': 'Basic ' + base64data, 
                    'Content-Type': 'multipart/form-data'
                    },
                    formData : {
                        "image" : fs.createReadStream(process.cwd() + "/" + userImagePath)
                    }
                };
                
                request(imgoptions, function (err, res, body) {
                    if(err) console.log(err);

                    if(debug) console.log("Image Upload Complete");
            
                });

            }

        }
        catch (error) {
            console.log(error);
        }

    }
    
    let end = new Date().getTime();

    res.status(200).json({ result: "Completed in " + (end - start) + " milliseconds"});
}
