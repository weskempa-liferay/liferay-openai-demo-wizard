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

  const [accountTopicInput, setAccountTopicInput] = useState("");
  const [accountNumberInput, setAccountNumberInput] = useState("");
    
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
    const response = await fetch("/api/accounts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accountTopic: accountTopicInput,
        accountNumber: accountNumberInput,
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

      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        
        <AppHeader 
            title={"Liferay Account Generator"} 
            desc={"Type your business description in the field below and wait for your Accounts. <br/> Leave the field blank for generic business accounts."} />
        
        <form onSubmit={onSubmit}>

          <div className="w-700 grid grid-cols-2 gap-2 sm:grid-cols-2 md:gap-4 mb-5">

            <FieldString 
                name={"topic"}
                label={"Business Description"} 
                placeholder={"Enter a Business Description"}
                inputChange={setAccountTopicInput}
                defaultValue={""}
                />

            <FieldString 
                name={"numberOfAccounts"}
                label={"Number of Accounts"} 
                placeholder={"Enter a the number of accounts to generate"}
                inputChange={setAccountNumberInput}
                defaultValue={""}
                />

          </div>
          
          <FieldSubmit label={"Generate Accounts"} disabled={isLoading} />
          
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