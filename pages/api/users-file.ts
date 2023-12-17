import OpenAI  from "openai";

var functions = require('../utils/functions');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function (req, res) {

    let start = new Date().getTime();
    let successCount = 0;
    let errorCount = 0;

    const debug = req.body.debugMode;
    let userlist = req.body.csvoutput;

    if(debug) console.log(userlist);

    const axios = require("axios");
    const fs = require("fs");

    const usernamePasswordBuffer = Buffer.from( 
        process.env.LIFERAY_ADMIN_EMAIL_ADDRESS + 
        ':' + process.env.LIFERAY_ADMIN_PASSWORD);

    const base64data = usernamePasswordBuffer.toString('base64');

    let roleList = await getRoleList(base64data,debug);

    let userApiPath = process.env.LIFERAY_PATH + "/o/headless-admin-user/v1.0/user-accounts";
    let userImagePath = "";

    for(let i=0;i<userlist.length;i++){
    
        userImagePath = userlist[i].imageFile;
       
        delete userlist[i].imageFile;

        if(debug) console.log(userlist[i].emailAddress + ", userImagePath: " + userImagePath);

        if(debug) console.log("sending:");
        if(debug) console.log(userlist[i]);

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

            const fs = require('fs');
            const request = require('request');

            let roleBriefs = getRoleBriefs(userlist[i].jobTitle, roleList, debug);
            if(roleBriefs.length>0){

                let userRoleApiPath = process.env.LIFERAY_PATH + "/o/headless-admin-user/v1.0/roles/"+roleBriefs[0].id+"/association/user-account/"+ response.data.id;
                    
                if(debug) console.log(userRoleApiPath);
                
                let roleoptions = {
                    method: "POST",
                    url: userRoleApiPath,
                    port: 443,
                    headers: {
                    'Authorization': 'Basic ' + base64data, 
                    'Content-Type': 'multipart/form-data'
                    }
                };
                
                request(roleoptions, function (err, res, body) {
                    if(err) console.log(err);

                    if(debug) console.log("Role Association Complete");
                });

            }
          
            if(userImagePath.length>0){
                    
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
                        "image" : fs.createReadStream(process.cwd() + "/public/users/user-images/" + userImagePath)
                    }
                };
                
                request(imgoptions, function (err, res, body) {
                    if(err) console.log(err);

                    if(debug) console.log("Image Upload Complete");
                });

            }
            successCount++;
        }
        catch (error) {
            errorCount++;
            console.log(error);
        }

    }
    
    let end = new Date().getTime();

    res.status(200).json({ 
        result: successCount + " users added, " +
        errorCount + " errors in " +
        functions.millisToMinutesAndSeconds(end - start)
    });
}

async function getRoleList(base64data,debug){

    const axios = require("axios");

    let userApiPath = process.env.LIFERAY_PATH + "/o/headless-admin-user/v1.0/roles";

    let roleoptions = {
        method: "GET",
        port: 443,
        headers: {
            'Authorization': 'Basic ' + base64data,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    };

    const roleresponse = await axios.get(userApiPath, roleoptions);


    return roleresponse.data.items;
}

function getRoleBriefs(roleName, roleList, debug){

    let roleBriefs = [];

    if(debug) console.log("Checking against " + roleList.length + " roles.")

    for(let i = 0; i < roleList.length; i++){
        
        if(roleName==roleList[i].name){
            if(debug) console.log("Match on role id:" + roleList[i].id);
            
            let roleBrief = {"id":roleList[i].id};
            roleBriefs.push(roleBrief);
        }
    }

    return roleBriefs;
}