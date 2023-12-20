import { useState, useEffect } from "react";
import React from "react";
import AppHead from "./components/apphead";
import AppHeader from "./components/appheader";
import AppFooter from "./components/appfooter";
import ImageStyle from "./components/imagestyle";
import LoadingAnimation from "./components/loadinganimation";
import ResultDisplay from "./components/resultdisplay";

import hljs from "highlight.js";

export default function Review() {

  const [expectedCost, setExpectedCost] = useState("<$0.01");

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
    setExpectedCost(cost);
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

            <label className="flex max-w-xs flex-col text-slate-200">
              Company Theme
                <input
                  className="text-sm text-gray-base w-full 
                            mr-3 py-5 px-4 h-2 border 
                            border-gray-200 text-slate-700 rounded"
                                    
                  type="text"
                  name="companyTheme"
                  placeholder="Enter a Company Theme"
                  value={companyThemeInput}
                  onChange={(e) => setCompanyThemeInput(e.target.value)}
                />
            </label>

            <label className="flex max-w-xs flex-col text-slate-200">
              Category Name
                <input
                  className="text-sm text-gray-base w-full 
                            mr-3 py-5 px-4 h-2 border 
                            border-gray-200 text-slate-700 rounded"
                                    
                  type="text"
                  name="categoryName"
                  placeholder="Enter a Category Name"
                  value={categoryNameInput}
                  onChange={(e) => setCategoryNameInput(e.target.value)}
                />
            </label>

            <label className="flex max-w-xs flex-col text-slate-200">
              Number of Categories
                <input
                  className="text-sm text-gray-base w-full 
                            mr-3 py-5 px-4 h-2 border 
                            border-gray-200 text-slate-700 rounded"
                                    
                  type="text"
                  name="numberOfCategories"
                  placeholder="5"
                  value={categoryNumberInput}
                  onChange={(e) => setCategoryNumberInput(e.target.value)}
                />
            </label>
            
            <label className="flex max-w-xs flex-col text-slate-200">
              Number of Products per Category
                <input
                  className="text-sm text-gray-base w-full 
                            mr-3 py-5 px-4 h-2 border 
                            border-gray-200 text-slate-700 rounded"
                                    
                  type="text"
                  name="numberOfProducts"
                  placeholder="3"
                  value={productNumberInput}
                  onChange={(e) => setProductNumberInput(e.target.value)}
                />
            </label>
            
            <label className="flex max-w-xs flex-col text-slate-200">
              Global Site ID for Taxonomy
                <input
                  className="text-sm text-gray-base w-full 
                            mr-3 py-5 px-4 h-2 border 
                            border-gray-200 text-slate-700 rounded"
                                    
                  type="text"
                  name="globalSiteId"
                  placeholder=""
                  value={globalSiteIdInput}
                  onChange={(e) => setGlobalSiteIdInput(e.target.value)}
                />
            </label>

            <label className="flex max-w-xs flex-col text-slate-200">
                Product Catalog
                <select name="productCatalogSelect" 
                        value={productCatalogSelect}
                        onChange={(e) => setProductCatalogSelect(e.target.value)}
                        id="productCatalogSelect" 
                        className="bg-white border border-gray-200 
                        text-slate-700 text-sm rounded
                        block w-full p-2.5">
                        <option value="">None</option>
                        {productCatalogOptions.map((option) => {
                          return (
                            <option key={option.id} value={option.id}>
                              {option.name}
                            </option>
                          );
                        })}
                </select>
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
            Generate Products &nbsp;&nbsp; Estimated cost: {expectedCost}
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