import { useState, useEffect } from "react";
import React from "react";
import AppHead from "./components/apphead";
import AppHeader from "./components/appheader";
import AppFooter from "./components/appfooter";
import LoadingAnimation from "./components/loadinganimation";
import ResultDisplay from "./components/resultdisplay";
import ImageStyle from "./components/imagestyle";

import hljs from "highlight.js";

export default function Review() {

  const [expectedCost, setExpectedCost] = useState("<$0.01");
  const [imageGenerationType, setImageGenerationType] = useState("none");
  const [blogTopicInput, setBlogTopicInput] = useState("");
  const [showStyleInput, setShowImageStyleInput] = useState(false);
  const [imageStyleInput, setImageStyleInput] = useState("");

  const [blogLengthInput, setBlogLengthInput] = useState("200");
  const [siteIdInput, setSiteIdInput] = useState("");
  const [blogNumberInput, setBlogNumberInput] = useState("3");
  const [result, setResult] = useState(() => "");
  const [isLoading, setIsLoading] = useState(false);

  const [debugMode, setDebugMode] = useState(false);

  const onDebugModeChange = (value) => {
    setDebugMode(value);
  };

  const onImageStyleInputChange = (value) => {
    setImageStyleInput(value);
  };

  let USDollar = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
  });

  useEffect(() => {
    updateCost();
  }, [blogNumberInput,imageGenerationType]);

  const updateCost = () => {
    setShowImageStyleInput(false);
    
    let cost = "";

    if(isNaN(parseInt(blogNumberInput))){
      cost = "$0.00";
    }else if(imageGenerationType=="dall-e-3"){
      setShowImageStyleInput(true);
      cost = USDollar.format(parseInt(blogNumberInput) * 0.04);
    }else if(imageGenerationType=="dall-e-2"){
      cost = USDollar.format(parseInt(blogNumberInput) * 0.02);
    }else{
      cost = "<$0.01";
    }
    setExpectedCost(cost);
  }

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    const response = await fetch("/api/blogs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        blogTopic: blogTopicInput,
        blogLength: blogLengthInput,
        siteId: siteIdInput,
        blogNumber: blogNumberInput, 
        imageGeneration: imageGenerationType,
        imageStyle: imageStyleInput,
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
      <AppHead title={"Blog Generator"}/>

      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
      
        <AppHeader title={"Liferay Blog Generator"} desc={"Type your topic in the field below and wait for your blogs. <br/> Leave the field blank for a random blog topic."} />
        
        <form onSubmit={onSubmit}>
          
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:gap-4 mb-5">

            <label className="flex max-w-xs flex-col text-slate-200">
              Enter a blog topic:
              <input
                  className="text-sm text-gray-base w-full 
                                    mr-3 py-5 px-4 h-2 border 
                                    border-gray-200 text-slate-700 rounded"
                  type="text"
                  name="topic"
                  placeholder="Enter a blog topic"
                  value={blogTopicInput}
                  onChange={(e) => setBlogTopicInput(e.target.value)}
                />
            </label>

            <label className="flex max-w-xs flex-col text-slate-200">
              Number of Posts to Create (Max 10)
              <input
                className="text-sm text-gray-base w-full 
                                  py-5 px-4 h-2 border 
                                  border-gray-200 text-slate-700 rounded"
                type="text"
                name="blogNumber"
                placeholder="Number of blog posts"
                value={blogNumberInput}
                onChange={(e) => setBlogNumberInput(e.target.value)}
              />
            </label>
            
            <label className="flex max-w-xs flex-col text-slate-200">
              Expected blog post length (in # of words):
              <input
                  className="text-sm text-gray-base w-full 
                                    mr-3 py-5 px-4 h-2 border 
                                    border-gray-200 text-slate-700 rounded"
                  type="text"
                  name="topic"
                  placeholder="Enter a the expected blog length"
                  value={blogLengthInput}
                  onChange={(e) => setBlogLengthInput(e.target.value)}
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
                Image Generation
                <select name="imageGenerationType" 
                        value={imageGenerationType}
                        onChange={(e) => setImageGenerationType(e.target.value)}
                        id="imageGenerationType" 
                        className="bg-white border border-gray-200 
                        text-slate-700 text-sm rounded
                        block w-full p-2.5">
                    <option value="none">None</option>
                    <option value="dall-e-2">DALL·E 2 (Basic Images)</option>
                    <option value="dall-e-3">DALL·E 3 (Highest-Quality Images)</option>
                </select>
            </label>
      
            {showStyleInput ? (
              <ImageStyle styleInputChange={onImageStyleInputChange}/>
            ) : null}

          </div>
          
          <button disabled={isLoading}
            className="text-sm w-full font-extrabold bg-blue-600 h-10 text-white
                              rounded-2xl mb-10"
            type="submit"
          >
            Generate Blogs &nbsp;&nbsp; Estimated cost: {expectedCost}
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