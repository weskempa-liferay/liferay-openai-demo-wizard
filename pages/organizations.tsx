import { useState } from "react";
import React from "react";
import AppHead from "./components/apphead";
import AppHeader from "./components/appheader";
import AppFooter from "./components/appfooter";
import LoadingAnimation from "./components/loadinganimation";
import ResultDisplay from "./components/resultdisplay";
import FieldString from "./components/formfield-string";
import FieldSubmit from "./components/formfield-submit";

import hljs from "highlight.js";

export default function Review() {

  const [organizationTopicInput, setOrganizationTopicInput] = useState("National Internet, Phone, and Cable");
  const [childOrganizationtNumberInput, setChildOrganizationtNumberInput] = useState("3");
  const [departmentNumberInput, setDepartmentNumberInput] = useState("3");
  
  const [result, setResult] = useState(() => "");
  const [isLoading, setIsLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  const onDebugModeChange = (value) => {
    setDebugMode(value);
  };

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    if(debugMode) console.log("Posting!");
    const response = await fetch("/api/organizations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        organizationTopic: organizationTopicInput,
        childOrganizationtNumber:childOrganizationtNumberInput,
        departmentNumber:departmentNumberInput,
        debugMode: debugMode
      }),
    
    });
    const data = await response.json();
    if(debugMode) console.log("data", data);

    const hljsResult = hljs.highlightAuto(data.result).value;
    setResult(hljsResult);

    setIsLoading(false);
  }

  return (
    <div>
      <AppHead title={"Account Generator"}/>

      <main className="py-20 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        
        <AppHeader 
            title={"Liferay Organization Generator"} 
            desc={"Type your business description in the field below and wait for your organizations."} />
        
        <form onSubmit={onSubmit}>

          <div className="w-700 grid grid-cols-2 gap-2 sm:grid-cols-2 md:gap-4 mb-5">

            <FieldString 
                name={"topic"}
                label={"Business Description"} 
                placeholder={"Enter a business description"}
                inputChange={setOrganizationTopicInput}
                defaultValue={"National Internet, Phone, and Cable"}
                />
            
            <FieldString 
                name={"numberOfChildOrganizations"}
                label={"Prefered Number of Child Organizations"} 
                placeholder={"Enter a the number of child organizations to generate"}
                inputChange={setChildOrganizationtNumberInput}
                defaultValue={"3"}
                />
        
            <FieldString 
                name={"numberOfDepartments"}
                label={"Prefered Number of Departments"} 
                placeholder={"Enter a the number of departments to generate"}
                inputChange={setDepartmentNumberInput}
                defaultValue={"3"}
                />

          </div>
          
          <FieldSubmit label={"Generate Organizations"} disabled={isLoading} />
          
        </form>

        {isLoading ? (
          <LoadingAnimation/>
        ) : result ? (
          <ResultDisplay result={result} />
        ) : null}

      </main>
      
      <AppFooter debugModeChange={onDebugModeChange} />

    </div>
  );
}