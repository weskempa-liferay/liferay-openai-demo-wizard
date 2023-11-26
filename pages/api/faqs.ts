import OpenAI  from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export default async function (req, res) {

    let start = new Date().getTime();

    /*

        const axios = require("axios");
        const fs = require("fs");


        const usernamePasswordBuffer = Buffer.from( 
            process.env.LIFERAY_ADMIN_EMAIL_ADDRESS + 
            ':' + process.env.LIFERAY_ADMIN_PASSWORD);

        const base64data = usernamePasswordBuffer.toString('base64');

        let blogImageApiPath = process.env.LIFERAY_PATH + "o/headless-delivery/v1.0/sites/20119/blog-posting-images";

        const options = {
            method: "POST",
            url: blogImageApiPath,
            port: 443,
            headers: {
                'Authorization': 'Basic ' + base64data,
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data'
            },
            formData: formData
        };

        try {
            const response = await axios.post(blogImageApiPath,
            formData, options);

            //console.log(response.data);
        }
        catch (error) {
            console.log(error);
        }

        console.log("Click!");
    */

    let end = new Date().getTime();

    res.status(200).json({ result: "Completed in " + (end - start) + " milliseconds"});
}