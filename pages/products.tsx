import { useState, useRef, useEffect } from "react";
import React from "react";
import AppHead from "./components/apphead";
import AppHeader from "./components/appheader";
import AppFooter from "./components/appfooter";
import AppImageStyle from "./components/appimagestyle";

import hljs from "highlight.js";

export default function Review() {
  
  const textDivRef = useRef<HTMLDivElement>(null);

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
    console.log("Load");

    const fetchData = async () => {
      const response = await fetch("/api/catalogs");
      const catalogs = await response.json();

      console.log(catalogs);
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

    console.log(categoryNumberInput);
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
        numberOfCategoriest: categoryNumberInput, 
        numberofProducts: productNumberInput,
        gloablSiteId:globalSiteIdInput,
        catalogId:productCatalogSelect,
        imageGeneration:imageGenerationType,
        imageStyle: imageStyleInput,
        debugMode: debugMode
      }),
    });
    const data = await response.json();
    console.log("data", data);
    console.log("data.result", data.result);

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
              <AppImageStyle styleInputChange={onImageStyleInputChange}/>
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