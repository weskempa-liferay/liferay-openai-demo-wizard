import hljs from 'highlight.js';
import { useState } from 'react';
import React from 'react';

import TopNavItem from '../components/apptopnavitem';
import FieldFile from '../components/formfield-file';
import FieldSubmit from '../components/formfield-submit';
import Layout from '../components/layout';
import LoadingAnimation from '../components/loadinganimation';
import ResultDisplay from '../components/resultdisplay';
import functions from '../utils/functions';
import { logger } from '../utils/logger';

const debug = logger('UsersFile');

export default function UsersFile() {
  const [file, setFile] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(() => '');

  const [appConfig, setAppConfig] = useState({
    model: functions.getDefaultAIModel(),
  });

  const handleOnChange = (file) => {
    setFile(file.target.files[0]);
  };

  const handleExampleClick = () => {
    window.open('users/users.csv');
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
    const response = await fetch('/api/users-file', {
      body: JSON.stringify({
        config: appConfig,
        csvoutput: csvOutput,
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
    <Layout
      description="Use the form below to create users."
      setAppConfig={setAppConfig}
      title="Liferay User Generator"
    >
      <div className="fixed top-2 right-5 text-lg download-options p-5 rounded">
        <TopNavItem
          label="Example Users CSV File"
          onClick={handleExampleClick}
        />
      </div>

      <form onSubmit={onSubmit}>
        <div className="w-500 grid grid-cols-1 gap-2 sm:grid-cols-1 md:gap-4 mb-5">
          <FieldFile
            accept=".csv"
            inputChange={handleOnChange}
            label="Users CSV File"
            name="fileUpload"
          />
        </div>

        <FieldSubmit disabled={isLoading} label={'Import Users'} />
      </form>

      {isLoading ? (
        <LoadingAnimation />
      ) : (
        result && <ResultDisplay result={result} />
      )}
    </Layout>
  );
}
