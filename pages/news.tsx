import Head from "next/head";
import { useState, useRef, useEffect } from "react";
import React from "react";
import Link from "next/link";
import AppFooter from "./appfooter";

import hljs from "highlight.js";

export default function Review() {

  const textDivRef = useRef<HTMLDivElement>(null);
  
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
  const [result, setResult] = useState(() => "");
  const [isLoading, setIsLoading] = useState(false);
  const [imageFolderDisabled, setImageFolderDisabled] = useState(true);

  const [debugMode, setDebugMode] = useState(false);

  const onDebugModeChange = (value) => {
    setDebugMode(value);
  };

  let USDollar = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
  });

  useEffect(() => {
    updateCost();
  }, [newsNumberInput,imageGenerationType]);

  const updateCost = () => {
    let cost = "";

    console.log(newsNumberInput);
    setImageFolderDisabled(true);
    if(isNaN(parseInt(newsNumberInput))){
      cost = "$0.00";
    }else if(imageGenerationType=="dall-e-3"){
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
      filePath: "news/Structure-News_Article",
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
        debugMode: debugMode
      }),
    });
    const data = await response.json();
    console.log("data", data);

    const hljsResult = hljs.highlightAuto(data.result).value;
    setResult(hljsResult);

    setIsLoading(false);
  }

  return (
    <div>
       <Head>
      <title>Liferay OpenAI Demo Content Wizard - News Generator</title>
      <meta name="description" content="" />
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        
        <div className="fixed top-0 left-5 p-5">
          <Link
            className="rounded-xl p-1 text-white "
            href="/"
          >
            <h3 className="text-1xl font-bold text-[hsl(210,70%,70%)]">← Return to Index</h3>
          </Link>
        </div>

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
        
        <h3 className="text-slate-200 font-bold text-3xl mb-3">
          Liferay News Generator
        </h3>
        <p className="text-slate-400 text-center text-lg mb-10">
          <i>Type your topic in the field below and wait for your News. <br/> Leave the 'News Topic' field blank for a random News topic.</i>
        </p>
        
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
              Web Content Folder ID
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
          <div>
            <p className="text-slate-200">Generating content... be patient.. </p>

            <div role="status">
                <svg aria-hidden="true" className="mx-auto mt-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
                <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : result ? (
          <div className="relative w-2/4 ">
            <div className="rounded-md border-spacing-2 border-slate-900 bg-slate-100 break-words max-w-500 overflow-x-auto  ">
              <div
                ref={textDivRef}
                className="m-5 "
                dangerouslySetInnerHTML={{ __html: result }}
              />
            </div>
          </div>
        ) : null}
      </main>
      
      <AppFooter debugModeChange={onDebugModeChange} />

    </div>
  );
}