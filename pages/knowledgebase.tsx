import { useState } from "react";
import React from "react";
import AppHead from "./components/apphead";
import AppHeader from "./components/appheader";
import AppFooter from "./components/appfooter";
import LoadingAnimation from "./components/loadinganimation";
import ResultDisplay from "./components/resultdisplay";

import hljs from "highlight.js";

export default function Review() {

  const [kbTopicInput, setMBTopicInput] = useState("");
  const [kbArticleLengthInput, setMBArticleLengthInput] = useState("100");
  const [siteIdInput, setSiteIdInput] = useState("");
  const [kbFolderNumberInput, setMBFolderNumberInput] = useState("3");
  const [kbArticleNumberInput, setMBArticleNumberInput] = useState("4");
  const [kbSuggestionNumberInput, setMBSuggestionNumberInput] = useState("2");
  const [result, setResult] = useState(() => "");
  const [isLoading, setIsLoading] = useState(false);

  const [debugMode, setDebugMode] = useState(false);

  const onDebugModeChange = (value) => {
    setDebugMode(value);
  };

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    const response = await fetch("/api/knowledgebase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        kbTopic: kbTopicInput,
        siteId: siteIdInput,
        kbFolderNumber: kbFolderNumberInput, 
        kbArticleNumber: kbArticleNumberInput, 
        kbSuggestionNumber: kbSuggestionNumberInput, 
        kbArticleLength: kbArticleLengthInput,
        debugMode: debugMode
      }),
    });
    const data = await response.json();

    const hljsResult = hljs.highlightAuto(data.result).value;
    setResult(hljsResult);

    setIsLoading(false);
  }

  return (
    <div>
      <AppHead title={"Knowledge Base Content Generator"}/>

      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        
        <AppHeader title={"Liferay Knowledge Base Content Generator"} desc={"Type your topic in the field below and wait for your Knowledge Base Threads. <br/> Leave the field blank for a random Knowledge Base topic."} />
        
        <form onSubmit={onSubmit}>
          
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:gap-4 mb-5">

            <label className="flex max-w-xs flex-col text-slate-200">
              Enter a Knowledge Base topic:
              <input
                  className="text-sm text-gray-base w-full 
                                    mr-3 py-5 px-4 h-2 border 
                                    border-gray-200 text-slate-700 rounded"
                  type="text"
                  name="topic"
                  placeholder="Enter a knowledge base topic"
                  value={kbTopicInput}
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
              Expected Article Length (in # of words):
              <input
                  className="text-sm text-gray-base w-full 
                                    mr-3 py-5 px-4 h-2 border 
                                    border-gray-200 text-slate-700 rounded"
                  type="text"
                  name="topic"
                  placeholder="Enter a knowledge base thread length"
                  value={kbArticleLengthInput}
                  onChange={(e) => setMBArticleLengthInput(e.target.value)}
                />
            </label>

            <label className="flex max-w-xs flex-col text-slate-200">
              Number of Folders to Create
              <input
                className="text-sm text-gray-base w-full 
                                  py-5 px-4 h-2 border 
                                  border-gray-200 text-slate-700 rounded"
                type="text"
                name="kbNumber"
                placeholder="Number of of knowledge base sections"
                value={kbFolderNumberInput}
                onChange={(e) => setMBFolderNumberInput(e.target.value)}
              />
            </label>

            <label className="flex max-w-xs flex-col text-slate-200">
              Number of Articles to Create per Section
              <input
                className="text-sm text-gray-base w-full 
                                  py-5 px-4 h-2 border 
                                  border-gray-200 text-slate-700 rounded"
                type="text"
                name="kbNumber"
                placeholder="Number of knowledge base articles per section"
                value={kbArticleNumberInput}
                onChange={(e) => setMBArticleNumberInput(e.target.value)}
              />
            </label>

            <label className="hidden flex max-w-xs flex-col text-slate-200">
              Suggestions to Create per Article
              <input
                className="text-sm text-gray-base w-full 
                                  py-5 px-4 h-2 border 
                                  border-gray-200 text-slate-700 rounded"
                type="text"
                name="kbNumber"
                placeholder="Number of knowledge base suggestion per section"
                value={kbSuggestionNumberInput}
                onChange={(e) => setMBSuggestionNumberInput(e.target.value)}
              />
            </label>

          </div>
          
          <button disabled={isLoading}
            className="text-sm w-full font-extrabold bg-blue-600 h-10 text-white
                              rounded-2xl mb-10"
            type="submit"
          >
            Generate Knowledge Base Articles
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