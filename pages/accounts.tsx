import hljs from 'highlight.js';
import { useState } from 'react';
import React from 'react';

import AppFooter from './components/appfooter';
import AppHead from './components/apphead';
import AppHeader from './components/appheader';
import FieldString from './components/formfield-string';
import FieldSubmit from './components/formfield-submit';
import LoadingAnimation from './components/loadinganimation';
import ResultDisplay from './components/resultdisplay';

export default function Review() {
  const [accountTopicInput, setAccountTopicInput] = useState('');
  const [accountNumberInput, setAccountNumberInput] = useState('');

  const [result, setResult] = useState(() => '');
  const [isLoading, setIsLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  const onDebugModeChange = (value) => {
    setDebugMode(value);
  };

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    if (debugMode) console.log('Posting!');
    const response = await fetch('/api/accounts', {
      body: JSON.stringify({
        accountNumber: accountNumberInput,
        accountTopic: accountTopicInput,
        debugMode: debugMode,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
    const data = await response.json();
    if (debugMode) console.log('data', data);

    const hljsResult = hljs.highlightAuto(data.result).value;
    setResult(hljsResult);

    setIsLoading(false);
  }

  return (
    <div>
      <AppHead title="Account Generator" />

      <main className="py-20 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        <AppHeader
          desc={
            'Type your business description in the field below and wait for your Accounts. <br/> Leave the field blank for generic business accounts.'
          }
          title={'Liferay Account Generator'}
        />

        <form onSubmit={onSubmit}>
          <div className="w-700 grid grid-cols-2 gap-2 sm:grid-cols-2 md:gap-4 mb-5">
            <FieldString
              defaultValue=""
              inputChange={setAccountTopicInput}
              label="Business Description"
              name="topic"
              placeholder="Enter a Business Description"
            />

            <FieldString
              defaultValue=""
              inputChange={setAccountNumberInput}
              label="Number of Accounts"
              name="numberOfAccounts"
              placeholder={'Enter a the number of accounts to generate'}
            />
          </div>

          <FieldSubmit disabled={isLoading} label="Generate Accounts" />
        </form>

        {isLoading ? (
          <LoadingAnimation />
        ) : (
          result && <ResultDisplay result={result} />
        )}
      </main>

      <AppFooter debugModeChange={onDebugModeChange} />
    </div>
  );
}
