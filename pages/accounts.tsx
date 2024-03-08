import hljs from 'highlight.js';
import { useState } from 'react';
import React from 'react';

import FieldString from '../components/formfield-string';
import FieldSubmit from '../components/formfield-submit';
import Layout from '../components/layout';
import LoadingAnimation from '../components/loadinganimation';
import ResultDisplay from '../components/resultdisplay';
import functions from '../utils/functions';
import { logger } from '../utils/logger';

const debug = logger('Accounts');

export default function Review() {
  const [accountNumberInput, setAccountNumberInput] = useState('');
  const [accountTopicInput, setAccountTopicInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');

  const [appConfig, setAppConfig] = useState({
    model: functions.getDefaultAIModel(),
  });

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    debug('Posting Accounts');

    const response = await fetch('/api/accounts', {
      body: JSON.stringify({
        accountNumber: accountNumberInput,
        accountTopic: accountTopicInput,
        config: appConfig,
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
      description={`Type your business description in the field below and wait for your Accounts. Examples of business descriptions are "automotive supplies", "medical equipment", or "government services".`}
      setAppConfig={setAppConfig}
      title="Liferay Account Generator"
    >
      <form onSubmit={onSubmit}>
        <div className="w-700 grid grid-cols-2 gap-2 sm:grid-cols-2 md:gap-4 mb-5">
          <FieldString
            defaultValue=""
            inputChange={setAccountTopicInput}
            label="Business Description"
            name="businessDescription"
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
    </Layout>
  );
}
