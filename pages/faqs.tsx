import { useState, useRef } from "react";
import React from "react";
import AppHead from "./components/apphead";
import AppHeader from "./components/appheader";
import AppFooter from "./components/appfooter";
import LoadingAnimation from "./components/loadinganimation";
import ResultDisplay from "./components/resultdisplay";

import hljs from "highlight.js";

export default function Review() {

  const [faqTopicInput, setFAQTopicInput] = useState("");
  const [siteIdInput, setSiteIdInput] = useState("");
  const [faqNumberInput, setFAQNumberInput] = useState("5");
  const [faqFolderIdInput, setFAQFolderIdInput] = useState("0");
  const [faqStructureIdInput, setFAQStructureIdInput] = useState("");
  const [categoryIdsInput, setCategoryIdsInput] = useState("");
  
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
    const response = await fetch("/api/faqs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        faqTopic: faqTopicInput,
        siteId: siteIdInput,
        faqNumber: faqNumberInput, 
        folderId: faqFolderIdInput, 
        structureId: faqStructureIdInput,
        categoryIds:categoryIdsInput,
        debugMode: debugMode
      }),
    
    });
    const data = await response.json();
    if(debugMode) console.log("data", data);

    const hljsResult = hljs.highlightAuto(data.result).value;
    setResult(hljsResult);

    setIsLoading(false);
  }

  const handleStructureClick = () => {
    downloadFile({
      filePath: "faqs/Structure-Frequently_Asked_Question.json",
      fileName: "Structure-Frequently_Asked_Question.json"
    });
  }

  const downloadFile = ({ filePath, fileName }) => {
    const a = document.createElement('a')
    a.download = fileName;
    a.href = filePath;
    const clickEvt = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    })
    a.dispatchEvent(clickEvt)
    a.remove()
  }

  const handleFragmentClick = () => {
    location.href='faqs/Fragment-FAQ.zip';
  }

  return (
    <div>
      <AppHead title={"FAQ Generator"}/>

      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        
        <AppHeader title={"Liferay FAQ Generator"} desc={"Type your topic in the field below and wait for your FAQs. <br/> Leave the field blank for a random faq topic."} />

        <div className="fixed top-2 right-5 p-5 text-lg download-options p-5 rounded">
            <button id="structure-download" className="bg-gray-200 hover:bg-grey text-grey-lightest font-bold py-2 px-4 rounded inline-flex items-center" onClick={handleStructureClick}>
                <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
                <span>FAQ Structure</span>
            </button>&nbsp;
            <button className="bg-gray-200 hover:bg-grey text-grey-lightest font-bold py-2 px-4 rounded inline-flex items-center" onClick={handleFragmentClick}>
                <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
                <span>FAQ Fragment</span>
            </button>
        </div>
        
        <form onSubmit={onSubmit}>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:gap-4 mb-5">

            <label className="flex max-w-xs flex-col text-slate-200">
              Enter a FAQ topic:
              <input
                  className="text-sm text-gray-base w-full 
                                    mr-3 py-5 px-4 h-2 border 
                                    border-gray-200 text-slate-700 rounded"
                  type="text"
                  name="topic"
                  placeholder="Enter a FAQ Topic"
                  value={faqTopicInput}
                  onChange={(e) => setFAQTopicInput(e.target.value)}
                />
            </label>

            <label className="flex max-w-xs flex-col text-slate-200">
              Number of Q&A Pairs to Create (Max 10)
              <input
                className="text-sm text-gray-base w-full 
                                  py-5 px-4 h-2 border 
                                  border-gray-200 text-slate-700 rounded"
                type="text"
                name="faqNumber"
                placeholder="Number of FAQ Posts"
                value={faqNumberInput}
                onChange={(e) => setFAQNumberInput(e.target.value)}
              />
            </label>

            <label className="flex max-w-xs flex-col text-slate-200 w-30">
              Site Id
              <input
                className="text-sm text-gray-base w-full 
                                   py-5 px-4 h-2 border 
                                  border-gray-200 text-slate-700 rounded"
                type="text"
                name="siteId"
                placeholder="Enter a Site ID"
                value={siteIdInput}
                onChange={(e) => setSiteIdInput(e.target.value)}
              />
            </label>

            <label className="flex max-w-xs flex-col text-slate-200 w-70">
              FAQ Structure ID
              <input
                className="text-sm text-gray-base w-full 
                                  py-5 px-4 h-2 border 
                                  border-gray-200 text-slate-700 rounded"
                type="text"
                name="faqNumber"
                placeholder="Number of FAQ Structure ID"
                value={faqStructureIdInput}
                onChange={(e) => setFAQStructureIdInput(e.target.value)}
              />
            </label>
            
            <label className="flex max-w-xs flex-col text-slate-200 w-30">
              Web Content Folder ID (0 for Root)
              <input
                className="text-sm text-gray-base w-full 
                                   py-5 px-4 h-2 border 
                                  border-gray-200 text-slate-700 rounded"
                type="text"
                name="folderId"
                placeholder="Enter a Folder ID"
                value={faqFolderIdInput}
                onChange={(e) => setFAQFolderIdInput(e.target.value)}
              />
            </label>
            
            <label className="flex max-w-xs flex-col text-slate-200 w-30">
              Comma-Delimited Category IDs (Optional)
              <input
                className="text-sm text-gray-base w-full 
                                   py-5 px-4 h-2 border 
                                  border-gray-200 text-slate-700 rounded"
                type="text"
                name="categoryIds"
                placeholder="List of Comma-Delimited Category IDs"
                value={categoryIdsInput}
                onChange={(e) => setCategoryIdsInput(e.target.value)}
              />
            </label>
          </div>
          
          <button disabled={isLoading}
            className="text-sm w-full bg-blue-600 h-10 text-white
                              rounded-2xl mb-10"
            type="submit"
          >
            Generate FAQs
          </button>
        </form>

        <p className="text-slate-100 text-center text-lg mb-3 rounded p-5 bg-white/10 italic">
          <b>Note:</b> FAQ generation requires a specific content structure. <br/> 
          Please use the supplied FAQ Structure and Fragment supplied above.
        </p>

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