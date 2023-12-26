import { useState, useEffect } from "react";
import AppHead from "./components/apphead";
import AppHeader from "./components/appheader";
import AppFooter from "./components/appfooter";
import LoadingAnimation from "./components/loadinganimation";
import ResultDisplay from "./components/resultdisplay";
import ImageStyle from "./components/imagestyle";
import FieldString from "./components/formfield-string";
import FieldImageType from "./components/formfield-imagetype";
import FieldSubmit from "./components/formfield-submit";

import hljs from "highlight.js";

export default function Review() {
  
  const [imageDescriptionInput, setImageDescriptionInput] = useState("");
  const [imageFolderIdInput, setImageFolderIdInput] = useState("");
  const [imageNumberInput, setImageNumberInput] = useState("1");
  const [imageGenerationType, setImageGenerationType] = useState("none");
  const [showStyleInput, setShowImageStyleInput] = useState(false);
  const [imageStyleInput, setImageStyleInput] = useState("");
  const [submitLabel, setSubmitLabel] = useState("");

  const [result, setResult] = useState(() => "");
  const [isLoading, setIsLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  const onDebugModeChange = (value) => {
    setDebugMode(value);
  };

  let USDollar = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
  });

  const onImageStyleInputChange = (value) => {
    setImageStyleInput(value);
  };

  useEffect(() => {
    updateCost();
  }, [imageNumberInput,imageGenerationType]);

  const updateCost = () => {
    setShowImageStyleInput(false);
    let cost = "";

    if(isNaN(parseInt(imageNumberInput))){
      cost = "$0.00";
    }else if(imageGenerationType=="dall-e-3"){
      setShowImageStyleInput(true);
      cost = USDollar.format(parseInt(imageNumberInput) * 0.04);
    }else if(imageGenerationType=="dall-e-2"){
      setShowImageStyleInput(false);
      cost = USDollar.format(parseInt(imageNumberInput) * 0.02);
    }else{
      cost = "<$0.01";
    }
    
    setSubmitLabel("Generate Images - Estimated cost: " + cost);
  }

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    const response = await fetch("/api/images", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        imageDescription: imageDescriptionInput, 
        imageStyle: imageStyleInput,
        imageFolderId:imageFolderIdInput,
        imageNumber: imageNumberInput, 
        imageGeneration: imageGenerationType,
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
      <AppHead title={"Image Generator"}/>

      <main className="py-20 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        
        <AppHeader title={"Liferay Image Generator"} desc={"Type your topic in the field below and wait for your images."} />

        <form onSubmit={onSubmit}>

          <div className="w-700 grid grid-cols-1 gap-2 sm:grid-cols-1 md:gap-4 mb-5">

            <FieldString
                    name={"imageDescription"}
                    label={"Enter an image description"} 
                    placeholder={"Provide a detailed description of the image(s) you want to generate."}
                    inputChange={setImageDescriptionInput}
                    defaultValue={""}
                  />

            {showStyleInput ? (
                <ImageStyle styleInputChange={onImageStyleInputChange}/>
            ) : null}

          </div>
          
          <div className="w-700 grid grid-cols-2 gap-2 sm:grid-cols-2 md:gap-4 mb-5">

            <FieldString 
                name={"imageNumber"}
                label={"Number of Images to Generate (Max 10)"} 
                placeholder={"Number of images"}
                inputChange={setImageNumberInput}
                defaultValue={"1"}
              />

            <FieldString 
                name={"imageFolderId"}
                label={"Image Folder ID"} 
                placeholder={"Enter a Document Library Folder ID"}
                inputChange={setImageFolderIdInput}
                defaultValue={""}
              />

            <FieldImageType
                inputChange={setImageGenerationType}
                includeNone={false}
              />

          </div>
          
          <FieldSubmit label={submitLabel} disabled={isLoading} />

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