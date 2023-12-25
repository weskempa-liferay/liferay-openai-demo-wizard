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

  const [userNumberInput, setUserNumberInput] = useState("5");
  const [emailPrefixInput, setEmailPrefixInput] = useState("liferay.xyz");
  const [passwordInput, setPasswordInput] = useState("password");
  

  const [result, setResult] = useState(() => "");
  const [isLoading, setIsLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  const onDebugModeChange = (value) => {
    setDebugMode(value);
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
        password: passwordInput,
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

          <div className="w-500 grid grid-cols-1 gap-2 sm:grid-cols-2 md:gap-4 mb-5">

            <FieldString 
                    name={"userNumber"}
                    label={"Number of Users to Create"} 
                    placeholder={"Number of users"}
                    inputChange={setUserNumberInput}
                    defaultValue={"5"}
                  />

            <FieldString 
                    name={"emailPrefix"}
                    label={"Email Prefix"} 
                    placeholder={"@liferay.xyz"}
                    inputChange={setEmailPrefixInput}
                    defaultValue={"@liferay.xyz"}
                  />

            <FieldString 
                    name={"password"}
                    label={"User Default Password"} 
                    placeholder={"password"}
                    inputChange={setPasswordInput}
                    defaultValue={"password"}
                  />
            
          </div>

          <FieldSubmit label={"Generate Users"} disabled={isLoading} />

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