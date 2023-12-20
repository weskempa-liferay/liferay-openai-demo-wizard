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

  const [kbTopicInput, setKBTopicInput] = useState("");
  const [kbArticleLengthInput, setKBArticleLengthInput] = useState("100");
  const [siteIdInput, setSiteIdInput] = useState("");
  const [kbFolderNumberInput, setKBFolderNumberInput] = useState("3");
  const [kbArticleNumberInput, setKBArticleNumberInput] = useState("4");
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

          <FieldString 
                  name={"topic"}
                  label={"Knowledge Base Topic"} 
                  placeholder={"Enter a knowledge base topic"}
                  inputChange={setKBTopicInput}
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
                  name={"articleLength"}
                  label={"Expected Article Length (in # of words)"} 
                  placeholder={"Enter a knowledge base article length"}
                  inputChange={setKBArticleLengthInput}
                  defaultValue={"100"}
                />

            <FieldString 
                  name={"kbNumber"}
                  label={"Number of Folders to Create"} 
                  placeholder={"Number of of knowledge base sections"}
                  inputChange={setKBFolderNumberInput}
                  defaultValue={"3"}
                />

            <FieldString 
                  name={"kbSectionNumber"}
                  label={"Number of Articles to Create per Section"} 
                  placeholder={"Number of of knowledge base sections"}
                  inputChange={setKBArticleNumberInput}
                  defaultValue={"4"}
                />

          </div>
          
          <FieldSubmit label={"Generate Knowledge Base Articles"} disabled={isLoading} />

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