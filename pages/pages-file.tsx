import hljs from 'highlight.js';
import { useState } from 'react';
import React from 'react';

import TopNavItem from '../components/apptopnavitem';
import FieldFile from '../components/formfield-file';
import FieldString from '../components/formfield-string';
import FieldSubmit from '../components/formfield-submit';
import Layout from '../components/layout';
import LoadingAnimation from '../components/loadinganimation';
import ResultDisplay from '../components/resultdisplay';
import nextAxios from '../services/next';
import { downloadFile } from '../utils/download';
import { logger } from '../utils/logger';

const debug = logger('PagesFile');

export default function PagesFile() {
  const [file, setFile] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [siteIdInput, setSiteIdInput] = useState('');

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

    const { data } = await nextAxios.post('/api/pages-file', {
      fileoutput: fileOutput,
      siteId: siteIdInput,
    });

    const hljsResult = hljs.highlightAuto(data.result).value;
    setResult(hljsResult);

    setIsLoading(false);
  }

  return (
    <Layout
      description="Use the form below to create pages."
      title="Liferay Page Generator"
    >
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
            accept=".json"
            inputChange={handleOnChange}
            label="Pages JSON File"
            name="fileUpload"
          />
        </div>

        <FieldSubmit disabled={isLoading} label={'Import Pages'} />
      </form>

      {isLoading ? (
        <LoadingAnimation />
      ) : (
        result && <ResultDisplay result={result} />
      )}
    </Layout>
  );
}
