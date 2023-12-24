import OpenAI  from "openai";

var functions = require('../utils/functions');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function (req, res) {

    let start = new Date().getTime();

    const debug = req.body.debugMode;

    if(debug) console.log(  "vocabularyName: " + req.body.vocabularyName +
                            ", categorytNumber: " + req.body.categorytNumber +
                            ", childCategorytNumber: " + req.body.childCategorytNumber +
                            ", siteId: " + req.body.siteId  );

    const categoriesSchema = {
        type: "object",
        properties: {
          categories: {
            type: "array",
            description: "An array of " + req.body.categorytNumber + " category names",
            items:{
              type:"object",
              properties:{
                name:{
                  type: "string",
                  description: "The name of the category."
                },
                childcategories: {
                  type:"array",
                  description: "An array of " + req.body.childCategorytNumber + " child categories.",
                  items:{
                    type:"object",
                    properties:{
                      name: {
                        type: "string",
                        description: "The name of the category."
                      }
                    }
                  },
                  required: ["name"]
                }
              },
              required: ["name","childcategories"]
            },
            required: ["categories"]
          }
        }
      }

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {"role": "system", "content": "You are an category manager responsible for listing the categories for your company."},
            { "role": "user", 
              "content": "Create a list of expected categories, and child categories for a company that provides " + req.body.vocabularyName + ". " +
                         "Do not include double quotes in the response."}
        ],
        functions: [
        {name: "get_categories", "parameters": categoriesSchema}
        ],
        temperature: 0.6,
    });

    let categories = JSON.parse(response.choices[0].message.function_call.arguments).categories;
    if(debug) console.log(JSON.stringify(categories));

    let vocabularyId = await createVocabulary(req.body.vocabularyName, req.body.siteId, debug);

    for(let i=0;i<categories.length;i++){
      if(debug) console.log(categories[i]);
        
      let categoryId = await createCategory(categories[i].name,vocabularyId,debug);
      let childcategories = categories[i].childcategories;

      if(debug) console.log(categoryId + " has " + childcategories.length + " child category.");

      for(let j=0;j<childcategories.length;j++){

        let childOrgId = await createChildCategory(childcategories[j].name,categoryId,debug);

      }
    }

    let end = new Date().getTime();

    res.status(200).json({ result: "Completed in " +
      functions.millisToMinutesAndSeconds(end - start)});
}

async function createVocabulary(vocabularyName, siteId, debug){

  /* Setup Vocabulary */

  const axios = require("axios");

  let apiPath = process.env.LIFERAY_PATH + "/o/headless-admin-taxonomy/v1.0/sites/" + siteId + "/taxonomy-vocabularies";
  let vocabPostObj = {'name': vocabularyName};

  let headerObj = {
    headers: {
    'Authorization': 'Basic ' + functions.getBase64data(),
    'Content-Type': 'application/json'
    }
  };
  
  let vocabularyId = "";

  try {
    const vocabResponse = await axios.post(apiPath,
      vocabPostObj, 
      headerObj);
  
      vocabularyId = vocabResponse.data.id;

      if(debug) console.log("vocabularyId is " + vocabResponse.data);
  }
  catch (error) {
    console.log(error);
    vocabularyId = error;
  }

  return vocabularyId;
}

async function createCategory (category, parentVocabId, debug){

    const axios = require("axios");
  
    let categoryJson = {'taxonomyVocabularyId' : parentVocabId, 'name' : category};
  
    let categoriesApiPath = process.env.LIFERAY_PATH + "/o/headless-admin-taxonomy/v1.0/taxonomy-vocabularies/" + parentVocabId + "/taxonomy-categories";
    
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
        const response = await axios.post(categoriesApiPath,
              categoryJson, options);
        
        returnid = response.data.id;
  
        if(debug) console.log("returned id:" + returnid);
    }
    catch (error) {
        console.log(error);
    }
  
    return returnid;
  }

  async function createChildCategory (category, parentCategoryId, debug){
  
    const axios = require("axios");
  
    let categoryJson = {'parentTaxonomyCategory' : {"id":parentCategoryId}, 'name' : category};
  
    let categoriesApiPath = process.env.LIFERAY_PATH + "/o/headless-admin-taxonomy/v1.0/taxonomy-categories/" + parentCategoryId + "/taxonomy-categories";
    
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
        const response = await axios.post(categoriesApiPath,
              categoryJson, options);
        
        returnid = response.data.id;
  
        if(debug) console.log("returned id:" + returnid);
    }
    catch (error) {
        console.log(error);
    }
  
    return returnid;
  }