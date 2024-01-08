import hljs from 'highlight.js';
import { useState, useEffect } from 'react';
import React from 'react';

import AppFooter from './components/appfooter';
import AppHead from './components/apphead';
import AppHeader from './components/appheader';
import TopNavItem from './components/apptopnavitem';
import FieldFile from './components/formfield-file';
import FieldString from './components/formfield-string';
import FieldSelect from './components/formfield-select';
import FieldSubmit from './components/formfield-submit';
import LoadingAnimation from './components/loadinganimation';
import ResultDisplay from './components/resultdisplay';
import { logger } from './utils/logger';

const debug = logger('ProductsFile');

export default function ProductsFile() {
  const [file, setFile] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [globalSiteIdInput, setGlobalSiteIdInput] = useState('');
  const [categoryNameInput,setCategoryNameInput] = useState("Furniture");
  const [productCatalogSelect, setProductCatalogSelect] = useState('');
  const [productCatalogOptions, setProductCatalogOptions] = useState([]);
  const [result, setResult] = useState(() => '');

  useEffect(() => {
    debug('Load');

    const fetchData = async () => {
      const response = await fetch('/api/catalogs');
      const catalogs = await response.json();

      debug(catalogs);
      setProductCatalogOptions(catalogs);
      setProductCatalogSelect(catalogs[0].id);
    };

    fetchData();
  }, []);


  const handleOnChange = (file) => {
    setFile(file.target.files[0]);
  };

  const handleExampleClick = () => {
    window.open('products/products.csv');
  };

  const csvFileToArray = (string) => {
    const csvHeader = string.slice(0, string.indexOf('\n')).split(',');
    const csvRows = string.slice(string.indexOf('\n') + 1).split('\n');

    const array = csvRows.map((i) => {
      const values = i.split(',');
      const obj = csvHeader.reduce((object, header, index) => {
        object[header] = values[index];
        return object;
      }, {});
      return obj;
    });

    return array;
  };

  async function onSubmit(event) {
    event.preventDefault();
    const fileReader = new FileReader();

    let csvOutput;

    if (file) {
      fileReader.onload = function (event) {
        debug(event.target.result);
        csvOutput = csvFileToArray(event.target.result);

        postResult(csvOutput);
      };

      fileReader.readAsText(file);
    }
  }

  async function postResult(csvOutput) {
    setIsLoading(true);
    const response = await fetch('/api/products-file', {
      body: JSON.stringify({
        csvoutput: csvOutput,
        catalogId: productCatalogSelect,
        gloablSiteId: globalSiteIdInput,
        categoryName: categoryNameInput
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
    const data = await response.json();
    debug('data', data);

    const hljsResult = hljs.highlightAuto(data.result).value;
    setResult(hljsResult);

    setIsLoading(false);
  }

  return (
    <div>
      <AppHead title="Products Generator" />

      <main className="py-20 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        <AppHeader
          desc="Use the form below to create products."
          title="Liferay Products Generator"
        />

        <div className="fixed top-2 right-5 text-lg download-options p-5 rounded">
          <TopNavItem
            label="Example products CSV File"
            onClick={handleExampleClick}
          />
        </div>

        <form onSubmit={onSubmit}>
          <div className="w-700 grid grid-cols-1 gap-2 sm:grid-cols-3 mb-5">

            <FieldString
              defaultValue="Furniture"
              inputChange={setCategoryNameInput}
              label="Name of Product Category"
              name="nameOfProductCategory"
              placeholder="Name of the Product Category"
            />

            <FieldString
              defaultValue=""
              inputChange={setGlobalSiteIdInput}
              label="Global Site ID for Taxonomy"
              name="globalSiteId"
              placeholder="Enter the global site ID"
            />

            <FieldSelect
              inputChange={setProductCatalogSelect}
              label="Product Catalog"
              name="productCatalogSelect"
              optionMap={productCatalogOptions}
            />
          
          </div>

          <div className="w-700 grid grid-cols-1 gap-2 sm:grid-cols-1 mb-5">

            <FieldFile
              inputChange={handleOnChange}
              label="File that contains products"
              name="fileUpload"
            />

          </div>

          <FieldSubmit disabled={isLoading} label={'Import Products'} />
        </form>

        {isLoading ? (
          <LoadingAnimation />
        ) : (
          result && <ResultDisplay result={result} />
        )}
      </main>

      <AppFooter />
    </div>
  );
}
