import { useState } from "react";
import React from "react";
import AppHead from "./components/apphead";
import AppHeader from "./components/appheader";
import TopNavItem from "./components/apptopnavitem";
import AppFooter from "./components/appfooter";
import LoadingAnimation from "./components/loadinganimation";
import ResultDisplay from "./components/resultdisplay";
import FieldFile from "./components/formfield-file";
import FieldSubmit from "./components/formfield-submit";

import hljs from "highlight.js";

export default function Review() {

  const [result, setResult] = useState(() => "");
  const [isLoading, setIsLoading] = useState(false);

  const [file, setFile] = useState();

  const [debugMode, setDebugMode] = useState(false);

  const onDebugModeChange = (value) => {
    setDebugMode(value);
  };

  const handleOnChange = (file) => {
    setFile(file.target.files[0]);
  };

  const handleExampleClick = () => {
    window.open('users/users.csv');
  }

  const csvFileToArray = string => {
    const csvHeader = string.slice(0, string.indexOf("\n")).split(",");
    const csvRows = string.slice(string.indexOf("\n") + 1).split("\n");

    const array = csvRows.map(i => {
      const values = i.split(",");
      const obj = csvHeader.reduce((object, header, index) => {
        object[header] = values[index];
        return object;
      }, {});
      return obj;
    });

    return array;
  };

  async function onSubmit(event) {
    event.preventDefault();
    const fileReader = new FileReader();

    let csvOutput;

    if (file) {
      fileReader.onload = function (event) {
        if(debugMode) console.log(event.target.result);
        csvOutput = csvFileToArray(event.target.result);

        postResult(csvOutput);

      };

      fileReader.readAsText(file);
    }

  }
  
  async function postResult (csvOutput) {

      setIsLoading(true);
      const response = await fetch("/api/users-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csvoutput: csvOutput,
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
      <AppHead title={"User Generator"}/>

      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        
        <AppHeader title={"Liferay User Generator"} desc={"Use the form below to create users."} />

        <div className="fixed top-2 right-5 p-5 text-lg download-options p-5 rounded">
          
          <TopNavItem label={"Example Users CSV File"} onClick={handleExampleClick} />

        </div>
        
        <form onSubmit={onSubmit}>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-1 md:gap-4 mb-5">

            <FieldFile
                    name={"fileUpload"}
                    label={"File that contains users"} 
                    inputChange={handleOnChange}
              />

          </div>
          
          <FieldSubmit label={"Import Users"} disabled={isLoading} />
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