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
    
  const [siteIdInput, setSiteIdInput] = useState("");
  const [vocabularyNameInput, setVocabularyNameInput] = useState("Types of books");
  const [categorytNumberInput, setCategorytNumberInput] = useState("5");
  const [childCategorytNumberInput, setChildCategorytNumberInput] = useState("3");
  
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
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        siteId: siteIdInput,
        vocabularyName: vocabularyNameInput,
        categorytNumber:categorytNumberInput,
        childCategorytNumber:childCategorytNumberInput,
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
            title={"Liferay Category Generator"} 
            desc={"Type your business description in the field below and wait for your categories."} />
        
        <form onSubmit={onSubmit}>

          <div className="w-700 grid grid-cols-2 gap-2 sm:grid-cols-2 md:gap-4 mb-5">

          <FieldString 
                name={"siteId"}
                label={"Site ID"} 
                placeholder={"Enter a site id."}
                inputChange={setSiteIdInput}
                defaultValue={""}
                />

            <FieldString 
                name={"vocabulary"}
                label={"Vocabulary Name"} 
                placeholder={"Enter a vocabulary name"}
                inputChange={setVocabularyNameInput}
                defaultValue={"Types of books"}
                />

            <FieldString 
                name={"topic"}
                label={"Number of Categories"} 
                placeholder={"Enter a the number of categories to generate"}
                inputChange={setCategorytNumberInput}
                defaultValue={"5"}
                />
            
            <FieldString 
                name={"numberOfChildCategories"}
                label={"Prefered Number of Child Categories"} 
                placeholder={"Enter a the number of child categories to generate"}
                inputChange={setChildCategorytNumberInput}
                defaultValue={"3"}
                />

          </div>
          
          <FieldSubmit label={"Generate Categories"} disabled={isLoading} />
          
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