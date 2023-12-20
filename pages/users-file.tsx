import { useState } from "react";
import React from "react";
import AppHead from "./components/apphead";
import AppHeader from "./components/appheader";
import AppFooter from "./components/appfooter";
import LoadingAnimation from "./components/loadinganimation";
import ResultDisplay from "./components/resultdisplay";

import hljs from "highlight.js";

export default function Review() {

  const [result, setResult] = useState(() => "");
  const [isLoading, setIsLoading] = useState(false);

  const [file, setFile] = useState();

  const [debugMode, setDebugMode] = useState(false);

  const onDebugModeChange = (value) => {
    setDebugMode(value);
  };

  const handleOnChange = (e) => {
    setFile(e.target.files[0]);
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
            <button id="structure-download" className="bg-gray-200 hover:bg-grey text-grey-lightest font-bold py-2 px-4 rounded inline-flex items-center" onClick={handleExampleClick}>
                <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
                <span>Example Users CSV File</span>
            </button>
        </div>
        
        <form onSubmit={onSubmit}>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-1 md:gap-4 mb-5">

            <label  className="block mb-2 p-4 text-sm font-medium text-gray-900 dark:text-white" htmlFor="csvFileInput">
              File that contains users
              <input
                className="block w-full text-sm text-gray-900 border border-gray-300  p-4 
                          rounded-lg cursor-pointer bg-gray-90 dark:text-gray-900 focus:outline-none 
                          dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
                type={"file"}
                accept={".csv"}
                name="userNumber"
                id={"csvFileInput"}
                onChange={handleOnChange}
              />
            </label>

          </div>
          
          <button disabled={isLoading}
            className="text-sm w-full bg-blue-600 h-10 text-white
                              rounded-2xl mb-10"
            type="submit"
          >
            Import Users
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