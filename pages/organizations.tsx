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
  const [organizationTopicInput, setOrganizationTopicInput] = useState(
    'National Internet, Phone, and Cable'
  );
  const [childOrganizationtNumberInput, setChildOrganizationtNumberInput] =
    useState('3');
  const [departmentNumberInput, setDepartmentNumberInput] = useState('3');

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
    const response = await fetch('/api/organizations', {
      body: JSON.stringify({
        childOrganizationtNumber: childOrganizationtNumberInput,
        debugMode: debugMode,
        departmentNumber: departmentNumberInput,
        organizationTopic: organizationTopicInput,
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
      <AppHead title="Organization Generator" />

      <main className="py-20 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        <AppHeader
          desc="Type your business description in the field below and wait for your organizations."
          title="Liferay Organization Generator"
        />

        <form onSubmit={onSubmit}>
          <div className="w-700 grid grid-cols-2 gap-2 sm:grid-cols-2 md:gap-4 mb-5">
            <FieldString
              defaultValue="National Internet, Phone, and Cable"
              inputChange={setOrganizationTopicInput}
              label="Business Description"
              name="orgtopic"
              placeholder="Enter a business description"
            />

            <FieldString
              defaultValue="3"
              inputChange={setChildOrganizationtNumberInput}
              label="Prefered Number of Child Organizations"
              name="numberOfChildOrganizations"
              placeholder="Enter a the number of child organizations to generate"
            />

            <FieldString
              defaultValue="3"
              inputChange={setDepartmentNumberInput}
              label="Prefered Number of Departments"
              name="numberOfDepartments"
              placeholder="Enter a the number of departments to generate"
            />
          </div>

          <FieldSubmit disabled={isLoading} label="Generate Organizations" />
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
