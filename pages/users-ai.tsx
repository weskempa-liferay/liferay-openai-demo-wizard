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

const debug = logger('UsersAI');

export default function UsersAI() {
  const [userNumberInput, setUserNumberInput] = useState('5');
  const [emailPrefixInput, setEmailPrefixInput] = useState('liferay.xyz');
  const [passwordInput, setPasswordInput] = useState('password');

  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [appConfig, setAppConfig] = useState({
    model: functions.getDefaultAIModel(),
  });

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    const response = await fetch('/api/users-ai', {
      body: JSON.stringify({
        config: appConfig,
        emailPrefix: emailPrefixInput,
        password: passwordInput,
        userNumber: userNumberInput,
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
      <form onSubmit={onSubmit}>
        <div className="w-500 grid grid-cols-1 gap-2 sm:grid-cols-2 md:gap-4 mb-5">
          <FieldString
            defaultValue="5"
            inputChange={setUserNumberInput}
            label="Number of Users to Create"
            name="userNumber"
            placeholder="Number of users"
          />

          <FieldString
            defaultValue="liferay.xyz"
            inputChange={setEmailPrefixInput}
            label="Email Domain (example.com)"
            name="companyEmailPrefix"
            placeholder="liferay.xyz"
          />

          <FieldString
            defaultValue="password"
            inputChange={setPasswordInput}
            label="User Default Password"
            name="password"
            placeholder="password"
          />
        </div>

        <FieldSubmit disabled={isLoading} label="Generate Users" />
      </form>

      {isLoading ? (
        <LoadingAnimation />
      ) : (
        result && <ResultDisplay result={result} />
      )}
    </Layout>
  );
}
