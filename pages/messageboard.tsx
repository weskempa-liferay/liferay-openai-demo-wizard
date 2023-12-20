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

  const [mbTopicInput, setMBTopicInput] = useState("");
  const [mbThreadLengthInput, setMBThreadLengthInput] = useState("50");
  const [siteIdInput, setSiteIdInput] = useState("");
  const [mbSectionNumberInput, setMBSectionNumberInput] = useState("3");
  const [mbThreadNumberInput, setMBThreadNumberInput] = useState("3");
  const [mbMessageNumberInput, setMBMessageNumberInput] = useState("2");
  const [result, setResult] = useState(() => "");
  const [isLoading, setIsLoading] = useState(false);

  const [debugMode, setDebugMode] = useState(false);

  const onDebugModeChange = (value) => {
    setDebugMode(value);
  };

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    const response = await fetch("/api/messageboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mbTopic: mbTopicInput,
        siteId: siteIdInput,
        mbSectionNumber: mbSectionNumberInput, 
        mbThreadNumber: mbThreadNumberInput, 
        mbMessageNumber: mbMessageNumberInput, 
        mbThreadLength: mbThreadLengthInput,
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
      <AppHead title={"Mesage Board Content Generator"}/>

      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        
        <AppHeader 
            title={"Liferay Message Board Content Generator"}
            desc={"Type your topic in the field below and wait for your Message Board Threads. <br/> Leave the field blank for a random Message Board topic."} />
        
        <form onSubmit={onSubmit}>
          
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:gap-4 mb-5">

            <FieldString 
                    name={"topic"}
                    label={"Message Board Topic"} 
                    placeholder={"Enter a message board topic"}
                    inputChange={setMBTopicInput}
                    defaultValue={""}
                  />

            <FieldString 
                    name={"siteId"}
                    label={"Site ID"} 
                    placeholder={"Enter a site id"}
                    inputChange={setSiteIdInput}
                    defaultValue={""}
                  />
            
            <FieldString 
                    name={"threadLength"}
                    label={"Expected Thread Length (in # of words)"} 
                    placeholder={"Enter a message board thread length"}
                    inputChange={setMBThreadLengthInput}
                    defaultValue={"50"}
                  />
            
            <FieldString 
                    name={"mbNumber"}
                    label={"Number of Sections to Create"} 
                    placeholder={"Number of message board sections"}
                    inputChange={setMBSectionNumberInput}
                    defaultValue={"3"}
                  />
            
            <FieldString 
                    name={"mbThreadNumber"}
                    label={"Number of Threads to Create per Section"} 
                    placeholder={"Message board threads per section"}
                    inputChange={setMBThreadNumberInput}
                    defaultValue={"3"}
                  />

            <FieldString 
                    name={"mbMessagesNumber"}
                    label={" Number of Messages to Create per Thread"} 
                    placeholder={"Message board messages per thread"}
                    inputChange={setMBMessageNumberInput}
                    defaultValue={"2"}
                  />

          </div>
          
          <FieldSubmit label={"Generate Message Board Threads"} disabled={isLoading} />

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