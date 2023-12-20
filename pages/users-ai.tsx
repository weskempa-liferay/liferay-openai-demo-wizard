import { useState } from "react";
import React from "react";
import AppHead from "./components/apphead";
import AppHeader from "./components/appheader";
import AppFooter from "./components/appfooter";
import LoadingAnimation from "./components/loadinganimation";
import ResultDisplay from "./components/resultdisplay";

import hljs from "highlight.js";

export default function Review() {

  const [userNumberInput, setUserNumberInput] = useState("5");
  const [emailPrefixInput, setEmailPrefixInput] = useState("liferay.xyz");
  
  const [userImageToggle, setUserImageToggle] = useState(true);
  const [result, setResult] = useState(() => "");
  const [isLoading, setIsLoading] = useState(false);

  const [debugMode, setDebugMode] = useState(false);

  const onDebugModeChange = (value) => {
    setDebugMode(value);
  };

  const handleChange = () => {
    setUserImageToggle(!userImageToggle);
  };

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    const response = await fetch("/api/users-ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userNumber: userNumberInput,
        emailPrefix: emailPrefixInput,
        includeImages: userImageToggle,
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

        <form onSubmit={onSubmit}>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:gap-4 mb-5">

            <label className="flex max-w-xs flex-col text-slate-200">
              Number of Users to Create
              <input
                className="text-sm text-gray-base w-full 
                                  py-5 px-4 h-2 border 
                                  border-gray-200 text-slate-700 rounded"
                type="text"
                name="userNumber"
                placeholder="Number of user posts"
                value={userNumberInput}
                onChange={(e) => setUserNumberInput(e.target.value)}
              />
            </label>

            <label className="flex max-w-xs flex-col text-slate-200">
              Email prefix
              <input
                className="text-sm text-gray-base w-full 
                                  py-5 px-4 h-2 border 
                                  border-gray-200 text-slate-700 rounded"
                type="text"
                name="userNumber"
                placeholder="@liferay.xyz"
                value={emailPrefixInput}
                onChange={(e) => setEmailPrefixInput(e.target.value)}
              />
            </label>
            
            <label className="imgtoggle elative  inline-flex items-center cursor-pointer hidden">
              <input type="checkbox" checked={userImageToggle} onChange={handleChange} value="" className="sr-only peer"/>
              <div className="absolute w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Generate Profile Pictures</span>
            </label>
            
          </div>
          
          <button disabled={isLoading}
            className="text-sm w-full bg-blue-600 h-10 text-white
                              rounded-2xl mb-10"
            type="submit"
          >
            Generate Users
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