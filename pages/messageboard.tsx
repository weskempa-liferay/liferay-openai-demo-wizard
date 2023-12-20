import { useState } from "react";
import React from "react";
import AppHead from "./components/apphead";
import AppHeader from "./components/appheader";
import AppFooter from "./components/appfooter";
import LoadingAnimation from "./components/loadinganimation";
import ResultDisplay from "./components/resultdisplay";

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
        
        <AppHeader title={"Liferay Message Board Content Generator"} desc={"Type your topic in the field below and wait for your Message Board Threads. <br/> Leave the field blank for a random Message Board topic."} />
        
        <form onSubmit={onSubmit}>
          
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:gap-4 mb-5">

            <label className="flex max-w-xs flex-col text-slate-200">
              Enter a Message Board topic:
              <input
                  className="text-sm text-gray-base w-full 
                                    mr-3 py-5 px-4 h-2 border 
                                    border-gray-200 text-slate-700 rounded"
                  type="text"
                  name="topic"
                  placeholder="Enter a message board topic"
                  value={mbTopicInput}
                  onChange={(e) => setMBTopicInput(e.target.value)}
                />
            </label>
            
            <label className="flex max-w-xs flex-col text-slate-200">
              Site Id
              <input
                className="text-sm text-gray-base w-full 
                                  py-5 px-4 h-2 border 
                                  border-gray-200 text-slate-700 rounded"
                type="text"
                name="siteId"
                placeholder="Enter a site id"
                value={siteIdInput}
                onChange={(e) => setSiteIdInput(e.target.value)}
              />
            </label>
            
            <label className="flex max-w-xs flex-col text-slate-200">
              Expected thread length (in # of words):
              <input
                  className="text-sm text-gray-base w-full 
                                    mr-3 py-5 px-4 h-2 border 
                                    border-gray-200 text-slate-700 rounded"
                  type="text"
                  name="topic"
                  placeholder="Enter a message board thread length"
                  value={mbThreadLengthInput}
                  onChange={(e) => setMBThreadLengthInput(e.target.value)}
                />
            </label>

            <label className="flex max-w-xs flex-col text-slate-200">
              Number of Sections to Create
              <input
                className="text-sm text-gray-base w-full 
                                  py-5 px-4 h-2 border 
                                  border-gray-200 text-slate-700 rounded"
                type="text"
                name="mbNumber"
                placeholder="Number of of message board sections"
                value={mbSectionNumberInput}
                onChange={(e) => setMBSectionNumberInput(e.target.value)}
              />
            </label>

            <label className="flex max-w-xs flex-col text-slate-200">
              Number of Threads to Create per Section
              <input
                className="text-sm text-gray-base w-full 
                                  py-5 px-4 h-2 border 
                                  border-gray-200 text-slate-700 rounded"
                type="text"
                name="mbNumber"
                placeholder="Number of message board threads per section"
                value={mbThreadNumberInput}
                onChange={(e) => setMBThreadNumberInput(e.target.value)}
              />
            </label>

            <label className="flex max-w-xs flex-col text-slate-200">
              Number of Messages to Create per Thread
              <input
                className="text-sm text-gray-base w-full 
                                  py-5 px-4 h-2 border 
                                  border-gray-200 text-slate-700 rounded"
                type="text"
                name="mbNumber"
                placeholder="Number of message board messages per section"
                value={mbMessageNumberInput}
                onChange={(e) => setMBMessageNumberInput(e.target.value)}
              />
            </label>

          </div>
          
          <button disabled={isLoading}
            className="text-sm w-full font-extrabold bg-blue-600 h-10 text-white
                              rounded-2xl mb-10"
            type="submit"
          >
            Generate Message Board Threads
          </button>

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