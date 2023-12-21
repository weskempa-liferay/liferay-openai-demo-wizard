import { useState } from "react";
import ObjectField from "./components/objectfield";
import AppHead from "./components/apphead";
import AppHeader from "./components/appheader";
import AppFooter from "./components/appfooter";
import LoadingAnimation from "./components/loadinganimation";
import ResultDisplay from "./components/resultdisplay";
import FieldString from "./components/formfield-string";
import FieldSubmit from "./components/formfield-submit";

import hljs from "highlight.js";

export default function Review() {

  const [aiRoleInput, setAiRoleInput] = useState("You are a helpful assistant responsible for providing a list of answers");
  const [aiRequestInput, setAiRequestInput] = useState("Provide a list of 10 countries in Europe");
  const [aiEndpointInput, setAiEndpointInput] = useState("/o/c/exampleobjects/batch");
  const [objectFields, setObjectFields] = useState([{fieldName:"",fieldDescription:"",fieldType:""}]);
  const [updateCount, setUpdateCount] = useState(0);
  
  const [result, setResult] = useState(() => "");
  const [isLoading, setIsLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  const onDebugModeChange = () => {
    setDebugMode(!debugMode);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    let postFields = {};
    
    for(let i = 0;i<objectFields.length;i++){
      let fieldName = objectFields[i].fieldName;
      postFields[fieldName] = {
        type:objectFields[i].fieldType,
        description:objectFields[i].fieldDescription
      }
    }

    const response = await fetch("/api/objects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        aiRole: aiRoleInput,
        aiRequest: aiRequestInput,
        aiEndpoint: aiEndpointInput, 
        objectFields: postFields,
        debugMode:debugMode
      }),
    
    });
    const data = await response.json();
    if(debugMode) console.log("data", data);

    const hljsResult = hljs.highlightAuto(data.result).value;

    setResult(hljsResult),
    setIsLoading(isLoading);
  }

  const addField = (event) => {
    event.preventDefault();

    let stack = objectFields;
    stack.push({fieldName:"",fieldDescription:"",fieldType:""})

    setObjectFields(stack);
    setUpdateCount(updateCount+1);
  }

  const removeField = (event) => {
    event.preventDefault();
    if(objectFields.length>1){
      let stack = objectFields.splice(0,objectFields.length-1);

      setObjectFields(stack);
      setUpdateCount(updateCount+1);
    }
  }

  const handleFieldChange = (event, key)  => {
    setObjectFields(updateStack(event,key));
  }

  const updateStack = (fieldSet,id) => {
    let fields = objectFields;
    
    fields.splice(id,1,fieldSet);
    return fields;
  }

  return (

      <div>
        <AppHead title={"Object Generator"}/>

        <main className="py-20 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
          
          <AppHeader title={"Liferay Object Data Generator"} desc={"Complete the prompts below and describe your object to create the object data."} />

          <form className="mb-6" onSubmit={onSubmit}>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-1 mb-5">

              <FieldString 
                      name={"role"}
                      label={"Enter the role the OpenAI should act as"} 
                      placeholder={"You are a helpful assistant responsible for providing a list of answers"}
                      inputChange={setAiRoleInput}
                      defaultValue={"You are a helpful assistant responsible for providing a list of answers"}
                    />
            
              <FieldString 
                    name={"topic"}
                    label={"Enter your specific request to OpenAI"} 
                    placeholder={"Provide a list of 10 countries in Europe"}
                    inputChange={setAiRequestInput}
                    defaultValue={"Provide a list of 10 countries in Europe"}
                  />
      
              <FieldString 
                    name={"endpoint"}
                    label={"Location of your object's batch endpoint (Example /o/c/exampleobjects/batch)"} 
                    placeholder={"/o/c/exampleobjects/batch"}
                    inputChange={setAiEndpointInput}
                    defaultValue={"/o/c/exampleobjects/batch"}
                  />
            </div>

            <div className=" bg-white/10 rounded p-3 mb-5">

                <h4 className="text-slate-200 font-bold mb-3">
                    Describe your object structure
                </h4>

                {Object.entries(objectFields).map(([key, value], index) => {
                  return (
                    <ObjectField key={index} id={index} handleChange={handleFieldChange} />
                  )})
                }

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:gap-4 mb-2">
                    <button onClick={addField}
                        className="text-sm pl-4 pr-4 rounded mt-6 disabled:bg-blue-800
                                  bg-blue-400 font-semibold h-7 text-white disabled:text-slate-400" >
                        Add Field
                    </button>
                    <button onClick={removeField}
                        disabled={objectFields.length <= 1 ? true : false}
                        className="text-sm pl-4 pr-4 rounded mt-6 disabled:bg-blue-800
                                    bg-blue-400 font-semiboldh-7 text-white disabled:text-slate-400" >
                        Remove Last Field
                    </button>
                </div>
            </div>
    
            <FieldSubmit label={"Generate Object Data"} disabled={isLoading} />

          </form>
          
          {isLoading ? (
            <LoadingAnimation/>
          ) : result ? (
            <ResultDisplay result={result} />
          ) : null}
          
        </main>
      
        <AppFooter debugModeChange={onDebugModeChange} />

        <div className="hidden">{updateCount}</div>
      
      </div>
      
  );
}