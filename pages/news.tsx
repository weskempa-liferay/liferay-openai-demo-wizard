import { useState, useEffect } from "react";
import AppHead from "./components/apphead";
import AppHeader from "./components/appheader";
import TopNavItem from "./components/apptopnavitem";
import AppFooter from "./components/appfooter";
import LoadingAnimation from "./components/loadinganimation";
import ResultDisplay from "./components/resultdisplay";
import ImageStyle from "./components/imagestyle";
import FieldString from "./components/formfield-string";
import FieldImageType from "./components/formfield-imagetype";
import FieldSubmit from "./components/formfield-submit";

import hljs from "highlight.js";

export default function Review() {
  
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
  const [showImageFolder, showImageFolderInput] = useState(false);
  const [submitLabel, setSubmitLabel] = useState("");

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
  }, [newsNumberInput,imageGenerationType]);

  const updateCost = () => {
    setShowImageStyleInput(false);
    let cost = "";

    showImageFolderInput(false);
    if(isNaN(parseInt(newsNumberInput))){
      cost = "$0.00";
    }else if(imageGenerationType=="dall-e-3"){
      setShowImageStyleInput(true);
      cost = USDollar.format(parseInt(newsNumberInput) * 0.04);
      showImageFolderInput(true);
    }else if(imageGenerationType=="dall-e-2"){
      cost = USDollar.format(parseInt(newsNumberInput) * 0.02);
      showImageFolderInput(true);
    }else{
      cost = "<$0.01";
    }
    
    setSubmitLabel("Generate News - Estimated cost: " + cost);
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

          <TopNavItem label={"News Structure"} onClick={handleStructureClick} />

          <TopNavItem label={"News Fragment"} onClick={handleFragmentClick} />

        </div>

        <form onSubmit={onSubmit}>
          
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:gap-4 mb-5">

            <FieldString 
                    name={"topic"}
                    label={"News topic"} 
                    placeholder={"Enter a News topic"}
                    inputChange={setNewsTopicInput}
                    defaultValue={""}
                  />

            <FieldString 
                  name={"newsNumber"}
                  label={"Number of Articles to Create (Max 10)"} 
                  placeholder={"Number of News posts"}
                  inputChange={setNewsNumberInput}
                  defaultValue={"3"}
                />
            
            <FieldString 
                  name={"newsLength"}
                  label={"Expected News Post Length (in # of words)"} 
                  placeholder={"Expected News Post Length"}
                  inputChange={setNewsLengthInput}
                  defaultValue={"150"}
                />
          
            <FieldString 
                  name={"siteId"}
                  label={"Site ID"} 
                  placeholder={"Enter a Site ID"}
                  inputChange={setSiteIdInput}
                  defaultValue={""}
                />
  
            <FieldString 
                  name={"webContentFolderId"}
                  label={"Web Content Folder ID (0 for Root)"} 
                  placeholder={"Enter a Web Content Folder ID"}
                  inputChange={setFolderIdInput}
                  defaultValue={"0"}
                />
  
            <FieldString 
                name={"structureId"}
                label={"Structure ID"} 
                placeholder={"Enter a Structure ID"}
                inputChange={setStructureIdInput}
                defaultValue={""}
              />
            
            <FieldString 
                name={"categoryIds"}
                label={"Comma-Delimited Category IDs (Optional)"} 
                placeholder={"List of Comma-Delimited Category IDs"}
                inputChange={setCategoryIdsInput}
                defaultValue={""}
              />

            <FieldImageType
                inputChange={setImageGenerationType}
              />

            {showImageFolder ? (
              <FieldString 
                  name={"imageFolderId"}
                  label={"Image Folder ID (0 for Doc Lib Root)"} 
                  placeholder={"Enter a Document Library Folder ID"}
                  inputChange={setImageFolderIdInput}
                  defaultValue={"0"}
                />
              ) : null}
      
            {showStyleInput ? (
                <ImageStyle styleInputChange={onImageStyleInputChange}/>
            ) : null}

          </div>
          
          <FieldSubmit label={submitLabel} disabled={isLoading} />

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