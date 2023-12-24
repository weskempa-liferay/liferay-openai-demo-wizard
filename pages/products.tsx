import { useState, useEffect } from "react";
import React from "react";
import AppHead from "./components/apphead";
import AppHeader from "./components/appheader";
import AppFooter from "./components/appfooter";
import ImageStyle from "./components/imagestyle";
import LoadingAnimation from "./components/loadinganimation";
import ResultDisplay from "./components/resultdisplay";
import FieldString from "./components/formfield-string";
import FieldSelect from "./components/formfield-select";
import FieldImageType from "./components/formfield-imagetype";
import FieldSubmit from "./components/formfield-submit";

import hljs from "highlight.js";

export default function Review() {

  const [companyThemeInput, setCompanyThemeInput] = useState("");
  const [categoryNameInput, setCategoryNameInput] = useState("");
  const [categoryNumberInput, setCategoryNumberInput] = useState("5");
  const [productNumberInput, setProductNumberInput] = useState("3");
  const [imageGenerationType, setImageGenerationType] = useState("none");
  const [imageStyleInput, setImageStyleInput] = useState("");
  const [showStyleInput, setShowImageStyleInput] = useState(false);

  const [globalSiteIdInput, setGlobalSiteIdInput] = useState("");
  const [productCatalogSelect, setProductCatalogSelect] = useState("");
  const [productCatalogOptions, setProductCatalogOptions] = useState([]);
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
    if(debugMode) console.log("Load");

    const fetchData = async () => {
      const response = await fetch("/api/catalogs");
      const catalogs = await response.json();

      if(debugMode) console.log(catalogs);
      setProductCatalogOptions(catalogs);
      setProductCatalogSelect(catalogs[0].id);
    }
  
    fetchData()
      .catch(console.error);
      
  }, []);

  useEffect(() => {
    updateCost();
  }, [categoryNumberInput, productNumberInput, imageGenerationType]);

  const updateCost = () => {
    setShowImageStyleInput(false);
    let cost = "";

    if(debugMode) console.log(categoryNumberInput);
    if(isNaN(parseInt(categoryNumberInput)) && isNaN(parseInt(productNumberInput))){
      cost = "$0.00";
    }else if(imageGenerationType=="dall-e-3"){
      setShowImageStyleInput(true);
      cost = USDollar.format(parseInt(categoryNumberInput) * parseInt(productNumberInput) * 0.04);
    }else if(imageGenerationType=="dall-e-2"){
      cost = USDollar.format(parseInt(categoryNumberInput) * parseInt(productNumberInput) * 0.02);
    }else{
      cost = "<$0.01";
    }
    
    setSubmitLabel("Generate Products - Estimated cost: " + cost);
  }

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    const response = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        companyTheme: companyThemeInput, 
        categoryName: categoryNameInput, 
        numberOfCategories: categoryNumberInput, 
        numberOfProducts: productNumberInput,
        gloablSiteId:globalSiteIdInput,
        catalogId:productCatalogSelect,
        imageGeneration:imageGenerationType,
        imageStyle: imageStyleInput,
        debugMode: debugMode
      }),
    });
    const data = await response.json();
    if(debugMode) console.log("data", data);
    if(debugMode) console.log("data.result", data.result);

    const hljsResult = hljs.highlightAuto(data.result).value;
    setResult(hljsResult);

    setIsLoading(false);
  }

  return (
    <div>
      <AppHead title={"Product Generator"}/>

      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
          
        <AppHeader title={"Liferay Product Generator"} desc={"This is an Open AI integration to generate demo products."} />

        <form onSubmit={onSubmit}>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:gap-4 mb-5">

            <FieldString 
                    name={"companyTheme"}
                    label={"Commerce Theme"} 
                    placeholder={"Enter a Company Theme"}
                    inputChange={setCompanyThemeInput}
                    defaultValue={""}
                  />
            
            <FieldString 
                    name={"categoryName"}
                    label={"Category Name"} 
                    placeholder={"Enter a Category Name"}
                    inputChange={setCategoryNameInput}
                    defaultValue={""}
                  />
            
            <FieldString 
                    name={"numberOfCategories"}
                    label={"Number of Categories"} 
                    placeholder={"Enter the number of Categories"}
                    inputChange={setCategoryNumberInput}
                    defaultValue={"5"}
                  />
          
            <FieldString 
                    name={"numberOfProducts"}
                    label={"Number of Products per Category"} 
                    placeholder={"Enter the number of Products per Category"}
                    inputChange={setProductNumberInput}
                    defaultValue={"3"}
                  />
            
            <FieldString 
                    name={"globalSiteId"}
                    label={"Global Site ID for Taxonomy Assignment"} 
                    placeholder={"Enter the Global Site ID"}
                    inputChange={setGlobalSiteIdInput}
                    defaultValue={""}
                  />

            <FieldSelect 
                    name={"productCatalogSelect"}
                    label={"Product Catalog"}
                    inputChange={setProductCatalogSelect}
                    optionMap={productCatalogOptions}
                  />

            <FieldImageType
                includeNone={true}
                inputChange={setImageGenerationType}
              />
            
            {showStyleInput ? (
              <ImageStyle styleInputChange={onImageStyleInputChange}/>
            ) : null}

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