import { useState, useRef } from "react";
import React from "react";
import AppHead from "./components/apphead";
import AppHeader from "./components/appheader";
import TopNavItem from "./components/apptopnavitem";
import AppFooter from "./components/appfooter";
import LoadingAnimation from "./components/loadinganimation";
import ResultDisplay from "./components/resultdisplay";
import FieldString from "./components/formfield-string";
import FieldSubmit from "./components/formfield-submit";

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
        
        <AppHeader 
            title={"Liferay FAQ Generator"} 
            desc={"Type your topic in the field below and wait for your FAQs. <br/> Leave the field blank for a random faq topic."} />

        <div className="fixed top-2 right-5 p-5 text-lg download-options p-5 rounded">

            <TopNavItem label={"FAQ Structure"} onClick={handleStructureClick} />

            <TopNavItem label={"FAQ Fragment"} onClick={handleFragmentClick} />

        </div>
        
        <form onSubmit={onSubmit}>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:gap-4 mb-5">

            <FieldString 
                  name={"topic"}
                  label={"Enter a FAQ topic"} 
                  placeholder={"Enter a FAQ Topic"}
                  inputChange={setFAQTopicInput}
                  defaultValue={""}
                />
                
            <FieldString 
                  name={"faqNumber"}
                  label={"Number of Q&A Pairs to Create"} 
                  placeholder={"Number of FAQs"}
                  inputChange={setFAQNumberInput}
                  defaultValue={"5"}
                />
            
            <FieldString 
                  name={"siteId"}
                  label={"Site ID"} 
                  placeholder={"Enter a Site ID"}
                  inputChange={setSiteIdInput}
                  defaultValue={""}
                />
        
            <FieldString 
                  name={"faqStructureID"}
                  label={"FAQ Structure ID"} 
                  placeholder={"Enter the FAQ Structure ID"}
                  inputChange={setFAQStructureIdInput}
                  defaultValue={""}
                />
            
            <FieldString 
                  name={"folderId"}
                  label={"Web Content Folder ID (0 for Root)"} 
                  placeholder={"Enter a Folder ID"}
                  inputChange={setFAQFolderIdInput}
                  defaultValue={"0"}
                />
        
            <FieldString 
                  name={"categoryIds"}
                  label={"Comma-Delimited Category IDs (Optional)"} 
                  placeholder={"List of Comma-Delimited Category IDs"}
                  inputChange={setCategoryIdsInput}
                  defaultValue={""}
                />
          </div>
          
          <FieldSubmit label={"Generate FAQs"} disabled={isLoading} />
          
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