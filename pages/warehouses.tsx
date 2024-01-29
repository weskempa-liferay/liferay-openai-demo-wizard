import hljs from 'highlight.js';
import { useState } from 'react';
import React from 'react';

import functions from './utils/functions';
import AppFooter from './components/appfooter';
import AppHead from './components/apphead';
import AppHeader from './components/appheader';
import FieldString from './components/formfield-string';
import FieldSubmit from './components/formfield-submit';
import LoadingAnimation from './components/loadinganimation';
import ResultDisplay from './components/resultdisplay';

export default function Review() {
  const [warehouseRegionInput, setWarehouseRegionInput] = useState(
    'Europe'
  );
  
  const [warehouseNumberInput, setWarehouseNumberInput] = useState('10');

  const [result, setResult] = useState(() => '');
  const [isLoading, setIsLoading] = useState(false);

  const [appConfig, setAppConfig] = useState({
    model:functions.getDefaultAIModel()
  });

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    
    const response = await fetch('/api/warehouses', {
      body: JSON.stringify({
        config: appConfig,
        warehouseNumber: warehouseNumberInput,
        warehouseRegion: warehouseRegionInput,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
    const data = await response.json();
    console.log('data', data);

    const hljsResult = hljs.highlightAuto(data.result).value;
    setResult(hljsResult);

    setIsLoading(false);
  }

  return (
    <div>
      <AppHead title="Warehouse Generator" />

      <main className="py-20 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        <AppHeader
          desc="Type your region into the field below and wait for your warehouses. <br/> Example regions  are 'global', 'Midwestern United States', 'Italy and surrounding countries'."
          title="Liferay Warehouse Generator"
        />

        <form onSubmit={onSubmit}>
          <div className="w-700 grid grid-cols-2 gap-2 sm:grid-cols-2 md:gap-4 mb-5">
            <FieldString
              defaultValue="Europe"
              inputChange={setWarehouseRegionInput}
              label="Region for Warehouses"
              name="regionName"
              placeholder="Enter a region for your warehouses"
            />

            <FieldString
              defaultValue="10"
              inputChange={setWarehouseNumberInput}
              label="Number of Warehouses"
              name="numberOfWarehouses"
              placeholder="Enter a the number of warehouses to generate"
            />
          </div>

          <FieldSubmit disabled={isLoading} label="Generate Warehouses" />
        </form>

        {isLoading ? (
          <LoadingAnimation />
        ) : (
          result && <ResultDisplay result={result} />
        )}
      </main>

      <AppFooter setConfig={setAppConfig}/>
    </div>
  );
}
