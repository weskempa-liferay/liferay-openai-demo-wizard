import hljs from 'highlight.js';
import { useEffect, useState } from 'react';
import React from 'react';

import AppFooter from './components/appfooter';
import AppHead from './components/apphead';
import AppHeader from './components/appheader';
import FieldImageType from './components/formfield-imagetype';
import FieldSelect from './components/formfield-select';
import FieldString from './components/formfield-string';
import FieldSubmit from './components/formfield-submit';
import ImageStyle from './components/imagestyle';
import LoadingAnimation from './components/loadinganimation';
import ResultDisplay from './components/resultdisplay';
import { logger } from './utils/logger';

const debug = logger('Products');

export default function Products() {
  const [companyThemeInput, setCompanyThemeInput] = useState('');
  const [vocabularyNameInput, setVocabularyNameInput] = useState('');
  const [categoryNumberInput, setCategoryNumberInput] = useState('5');
  const [productNumberInput, setProductNumberInput] = useState('3');
  const [imageGenerationType, setImageGenerationType] = useState('none');
  const [imageStyleInput, setImageStyleInput] = useState('');
  const [showStyleInput, setShowImageStyleInput] = useState(false);

  const [globalSiteIdInput, setGlobalSiteIdInput] = useState('');
  const [productCatalogSelect, setProductCatalogSelect] = useState('');
  const [productCatalogOptions, setProductCatalogOptions] = useState([]);
  const [submitLabel, setSubmitLabel] = useState('');

  const [result, setResult] = useState(() => '');
  const [isLoading, setIsLoading] = useState(false);

  const onImageStyleInputChange = (value) => {
    setImageStyleInput(value);
  };

  let USDollar = new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  });

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

  useEffect(() => {
    updateCost();
  }, [categoryNumberInput, productNumberInput, imageGenerationType]);

  const updateCost = () => {
    setShowImageStyleInput(false);
    let cost = '';

    debug(categoryNumberInput);
    if (
      isNaN(parseInt(categoryNumberInput)) &&
      isNaN(parseInt(productNumberInput))
    ) {
      cost = '$0.00';
    } else if (imageGenerationType == 'dall-e-3') {
      setShowImageStyleInput(true);
      cost = USDollar.format(
        parseInt(categoryNumberInput) * parseInt(productNumberInput) * 0.04
      );
    } else if (imageGenerationType == 'dall-e-2') {
      cost = USDollar.format(
        parseInt(categoryNumberInput) * parseInt(productNumberInput) * 0.02
      );
    } else {
      cost = '<$0.01';
    }

    setSubmitLabel('Generate Products - Estimated cost: ' + cost);
  };

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    const response = await fetch('/api/products-ai', {
      body: JSON.stringify({
        catalogId: productCatalogSelect,
        categoryName: vocabularyNameInput,
        companyTheme: companyThemeInput,
        gloablSiteId: globalSiteIdInput,
        imageGeneration: imageGenerationType,
        imageStyle: imageStyleInput,
        numberOfCategories: categoryNumberInput,
        numberOfProducts: productNumberInput,
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
      <AppHead title="Product Generator" />

      <main className="py-20 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        <AppHeader
          desc="This is an Open AI integration to generate demo products."
          title="Liferay Product Generator"
        />

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 mb-5">

            <FieldString
              defaultValue=""
              inputChange={setCompanyThemeInput}
              label="Commerce Theme"
              name="companyTheme"
              placeholder="Enter a company theme"
            />

            <FieldString
              defaultValue=""
              inputChange={setVocabularyNameInput}
              label="Vocabulary Name"
              name="vocabularyName"
              placeholder="Enter a vocabulary name"
            />

            <FieldString
              defaultValue="5"
              inputChange={setCategoryNumberInput}
              label="Number of Categories"
              name="numberOfCategories"
              placeholder="Enter the number of categories"
            />

            <FieldString
              defaultValue="3"
              inputChange={setProductNumberInput}
              label="Number of Products per Category"
              name="numberOfProducts"
              placeholder="Enter the number of products per category"
            />

            <FieldString
              defaultValue=""
              inputChange={setGlobalSiteIdInput}
              label="Global Site ID for Taxonomy Assignment"
              name="globalSiteId"
              placeholder="Enter the global site ID"
            />

            <FieldSelect
              inputChange={setProductCatalogSelect}
              label="Product Catalog"
              name="productCatalogSelect"
              optionMap={productCatalogOptions}
            />

            <FieldImageType includeNone inputChange={setImageGenerationType} />

            {showStyleInput && (
              <ImageStyle styleInputChange={onImageStyleInputChange} />
            )}
          </div>

          <FieldSubmit disabled={isLoading} label={submitLabel} />
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
