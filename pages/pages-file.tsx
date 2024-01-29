import hljs from 'highlight.js';
import { useState } from 'react';
import React from 'react';

import functions from './utils/functions';
import AppFooter from './components/appfooter';
import AppHead from './components/apphead';
import AppHeader from './components/appheader';
import TopNavItem from './components/apptopnavitem';
import FieldString from './components/formfield-string';
import FieldFile from './components/formfield-file';
import FieldSubmit from './components/formfield-submit';
import LoadingAnimation from './components/loadinganimation';
import ResultDisplay from './components/resultdisplay';
import { logger } from './utils/logger';

const debug = logger('PagesFile');

export default function PagesFile() {
  const [file, setFile] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(() => '');
  const [siteIdInput, setSiteIdInput] = useState('');

  const [appConfig, setAppConfig] = useState({
    model:functions.getDefaultAIModel()
  });

  const handleOnChange = (file) => {
    setFile(file.target.files[0]);
  };

  const handleExampleClick = () => {
    window.open('');

    downloadFile({
        fileName: 'pages.json',
        filePath: 'pages/pages.json',
    });
  };

  const downloadFile = ({ fileName, filePath }) => {
    const a = document.createElement('a');
    a.download = fileName;
    a.href = filePath;
    const clickEvt = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    a.dispatchEvent(clickEvt);
    a.remove();
  };

  async function onSubmit(event) {
    event.preventDefault();
    const fileReader = new FileReader();

    if (file) {
      fileReader.onload = function (event) {
        debug(event.target.result);
        postResult(event.target.result);
      };

      fileReader.readAsText(file);
    }
  }

  async function postResult(fileOutput) {
    setIsLoading(true);
    console.log(fileOutput);

    const response = await fetch('/api/pages-file', {
      body: JSON.stringify({
        config: appConfig,
        fileoutput: fileOutput,
        siteId:siteIdInput,
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
      <AppHead title="Page Generator" />

      <main className="py-20 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        <AppHeader
          desc="Use the form below to create pages."
          title="Liferay Page Generator"
        />

        <div className="fixed top-2 right-5 text-lg download-options p-5 rounded">
          <TopNavItem
            label="Example Pages JSON File"
            onClick={handleExampleClick}
          />
        </div>

        <form onSubmit={onSubmit}>
          <div className="w-500 grid grid-cols-1 gap-2 sm:grid-cols-1 md:gap-4 mb-5">
            <FieldString
                defaultValue=""
                inputChange={setSiteIdInput}
                label="Site ID"
                name="siteId"
                placeholder="Enter id of the site that you would like to add pages to"
            />
            <FieldFile
              inputChange={handleOnChange}
              label="Pages JSON File"
              name="fileUpload"
              accept=".json"
            />
          </div>

          <FieldSubmit disabled={isLoading} label={'Import Pages'} />
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
