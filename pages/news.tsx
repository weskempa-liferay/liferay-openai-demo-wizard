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
  const [newsTopicInput, setNewsTopicInput] = useState("");
  const [newsLengthInput, setNewsLengthInput] = useState("150");
  const [siteIdInput, setSiteIdInput] = useState("");
  const [folderIdInput, setFolderIdInput] = useState("");
  const [imageFolderIdInput, setImageFolderIdInput] = useState("0");
  const [structureIdInput, setStructureIdInput] = useState("");
  const [categoryIdsInput, setCategoryIdsInput] = useState("");
  const [newsNumberInput, setNewsNumberInput] = useState("3");
  const [imageGenerationType, setImageGenerationType] = useState("none");
  const [imageStyleInput, setImageStyleInput] = useState("");
  const [showStyleInput, setShowImageStyleInput] = useState(false);

  const [result, setResult] = useState(() => "");
  const [isLoading, setIsLoading] = useState(false);
  const [imageFolderDisabled, setImageFolderDisabled] = useState(true);

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
  }, [newsNumberInput,imageGenerationType]);

  const updateCost = () => {
    setShowImageStyleInput(false);
    let cost = "";

    setImageFolderDisabled(true);
    if(isNaN(parseInt(newsNumberInput))){
      cost = "$0.00";
    }else if(imageGenerationType=="dall-e-3"){
      setShowImageStyleInput(true);
      cost = USDollar.format(parseInt(newsNumberInput) * 0.04);
      setImageFolderDisabled(false);
    }else if(imageGenerationType=="dall-e-2"){
      cost = USDollar.format(parseInt(newsNumberInput) * 0.02);
      setImageFolderDisabled(false);
    }else{
      cost = "<$0.01";
    }
    setExpectedCost(cost);
  }

  const handleStructureClick = () => {
    downloadFile({
      filePath: "news/Structure-News_Article.json",
      fileName: "Structure-News_Article"
    });
  }

  const downloadFile = ({ filePath,fileName }) => {
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
    location.href='news/Fragment-News.zip';
  }

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    const response = await fetch("/api/news", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        newsTopic: newsTopicInput, 
        newsLength: newsLengthInput, 
        siteId: siteIdInput, 
        folderId: folderIdInput, 
        imageFolderId:imageFolderIdInput,
        structureId: structureIdInput, 
        categoryIds:categoryIdsInput,
        newsNumber: newsNumberInput, 
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
      <AppHead title={"News Generator"}/>

      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        
        <AppHeader title={"Liferay News Generator"} desc={"Type your topic in the field below and wait for your News. <br/> Leave the 'News Topic' field blank for a random News topic."} />

        <div className="fixed top-2 right-5 p-5 text-lg download-options p-5 rounded">
            <button id="structure-download" className="bg-gray-200 hover:bg-grey text-grey-lightest font-bold py-2 px-4 rounded inline-flex items-center" onClick={handleStructureClick}>
                <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
                <span>News Structure</span>
            </button>&nbsp;
            <button className="bg-gray-200 hover:bg-grey text-grey-lightest font-bold py-2 px-4 rounded inline-flex items-center" onClick={handleFragmentClick}>
                <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
                <span>News Fragment</span>
            </button>
        </div>

        <form onSubmit={onSubmit}>
          
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:gap-4 mb-5">

            <label className="flex max-w-xs flex-col text-slate-200">
              Enter a News Topic:
              <input
                  className="text-sm text-gray-base w-full 
                                    mr-3 py-5 px-4 h-2 border 
                                    border-gray-200 text-slate-700 rounded"
                  type="text"
                  name="topic"
                  placeholder="Enter a News topic"
                  value={newsTopicInput}
                  onChange={(e) => setNewsTopicInput(e.target.value)}
                />
            </label>

            <label className="flex max-w-xs flex-col text-slate-200">
              Number of Articles to Create (Max 10)
              <input
                className="text-sm text-gray-base w-full 
                                  py-5 px-4 h-2 border 
                                  border-gray-200 text-slate-700 rounded"
                type="text"
                name="newsNumber"
                placeholder="Number of News posts"
                value={newsNumberInput}
                onChange={(e) => setNewsNumberInput(e.target.value)}
              />
            </label>
            
            <label className="flex max-w-xs flex-col text-slate-200">
              Expected News Post Length (in # of words):
              <input
                  className="text-sm text-gray-base w-full 
                                    mr-3 py-5 px-4 h-2 border 
                                    border-gray-200 text-slate-700 rounded"
                  type="text"
                  name="topic"
                  placeholder="Enter a News Topic"
                  value={newsLengthInput}
                  onChange={(e) => setNewsLengthInput(e.target.value)}
                />
            </label>
            
            <label className="flex max-w-xs flex-col text-slate-200">
              Site ID
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
            
            <label className="flex max-w-xs flex-col text-slate-200">
              Web Content Folder ID (0 for Root)
              <input
                className="text-sm text-gray-base w-full 
                                  py-5 px-4 h-2 border 
                                  border-gray-200 text-slate-700 rounded"
                type="text"
                name="webContentFolderId"
                placeholder="Enter a Web Content Folder ID"
                value={folderIdInput}
                onChange={(e) => setFolderIdInput(e.target.value)}
              />
            </label>
            
            <label className="flex max-w-xs flex-col text-slate-200">
              Structure ID
              <input
                className="text-sm text-gray-base w-full 
                                  py-5 px-4 h-2 border 
                                  border-gray-200 text-slate-700 rounded"
                type="text"
                name="structureId"
                placeholder="Enter a Structure ID"
                value={structureIdInput}
                onChange={(e) => setStructureIdInput(e.target.value)}
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

            <label className="flex max-w-xs flex-col text-slate-200">
              Image Folder ID (0 for Doc Lib Root)
              <input
                className="text-sm text-gray-base w-full 
                                  py-5 px-4 h-2 border 
                                  border-gray-200 text-slate-700 rounded"
                type="text"
                name="imageFolderId"
                disabled={imageFolderDisabled}
                placeholder="Enter a Document Library Folder ID"
                value={imageFolderIdInput}
                onChange={(e) => setImageFolderIdInput(e.target.value)}
              />
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
            Generate News &nbsp;&nbsp; Estimated cost: {expectedCost}
          </button>
        </form>

        <p className="text-slate-100 text-center text-lg mb-3 rounded p-5 bg-white/10 italic">
          <b>Note:</b> News Article generation requires a specific content structure. <br/> 
          Please use the supplied News Structure supplied above.
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