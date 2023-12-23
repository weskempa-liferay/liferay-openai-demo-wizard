import OpenAI  from "openai";

var functions = require('../utils/functions');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function (req, res) {

    let start = new Date().getTime();

    const debug = req.body.debugMode;

    if(debug) console.log("childOrganizationtNumber: " + req.body.childOrganizationtNumber +
                          ", req.body.departmentNumber: " + req.body.departmentNumber);

    const organizationsSchema = {
        type: "object",
        properties: {
          organizations: {
            type: "array",
            description: "An array of business organization company names",
            items:{
              type:"object",
              properties:{
                name:{
                  type: "string",
                  description: "A creative name of the business organization."
                },
                childbusinesses: {
                  type:"array",
                  description: "An array of " + req.body.childOrganizationtNumber + " businesses within the organization",
                  items:{
                    type:"object",
                    properties:{
                      name: {
                        type: "string",
                        description: "A creative name of the business"
                      },
                      departments: {
                        type:"array",
                        description: "An array of " + req.body.departmentNumber + " departments within the business",
                        items:{
                          type:"object",
                          properties:{
                            name: {
                              type: "string",
                              description: "Name of the department"
                            }
                          }
                        },
                        required: ["name","departments"]
                      }
                    }
                  },
                  required: ["name"]
                }
              },
              required: ["name","childbusinesses"]
            },
            required: ["organizations"]
          }
        }
      }

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {"role": "system", "content": "You are an organization manager responsible for listing the business organizations for your company."},
            { "role": "user", 
              "content": "Create a list of expected organizations, child businesses, and departments for a company that provides " + req.body.organizationTopic + ". " +
                         "Do not include double quotes in the response."}
        ],
        functions: [
        {name: "get_organizations", "parameters": organizationsSchema}
        ],
        temperature: 0.6,
    });

    let organizations = JSON.parse(response.choices[0].message.function_call.arguments).organizations;
    if(debug) console.log(JSON.stringify(organizations));

    for(let i=0;i<organizations.length;i++){
      if(debug) console.log(organizations[i]);
        
      let orgId = await createOrganization(organizations[i],false,debug);
      let childbusinesses = organizations[i].childbusinesses;

      if(debug) console.log(orgId + " has " + childbusinesses.length + " child businesses.");

      for(let j=0;j<childbusinesses.length;j++){

        let childOrgId = await createOrganization(childbusinesses[j],orgId,debug);
        let departments = childbusinesses[j].departments;

        if(debug) console.log(childOrgId + " has " + departments.length + " related departments.");

        for(let k=0;k<departments.length;k++){

          createOrganization(departments[k],childOrgId,debug);

        }
      }
    }
    
    let end = new Date().getTime();

    res.status(200).json({ result: "Completed in " +
      functions.millisToMinutesAndSeconds(end - start)});
}

async function createOrganization (organization, parentOrgId, debug){

  if(debug) console.log("Creating " + organization.name + " with parent " + parentOrgId);

  let postBody;

  if(parentOrgId>0){
    postBody = {
      "name": organization.name,
      "parentOrganization": {
        id:parentOrgId
      }
    };
  }else{
    postBody = {
      "name": organization.name
    };
  }

  const axios = require("axios");

  let orgApiPath = process.env.LIFERAY_PATH + "/o/headless-admin-user/v1.0/organizations";

  const options = {
      method: "POST",
      port: 443,
      headers: {
          'Authorization': 'Basic ' + functions.getBase64data(),
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      }
  };

  let returnid = 0;

  try {
      const response = await axios.post(orgApiPath,
          postBody, options);
      
      returnid = response.data.id;

      if(debug) console.log("returned id:" + returnid);
  }
  catch (error) {
      console.log(error);
  }

  return returnid;
}