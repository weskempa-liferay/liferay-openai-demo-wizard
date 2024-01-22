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
  const [userGroupTopicInput, setOrganizationTopicInput] = useState(
    'Job Placement Services and Training'
  );
  const [userGroupNumberInput, setUserGroupNumberInput] = useState('10');

  const [result, setResult] = useState(() => '');
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    
    const response = await fetch('/api/usergroups', {
      body: JSON.stringify({
        userGroupNumber: userGroupNumberInput,
        userGroupTopic: userGroupTopicInput,
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
      <AppHead title="User Group Generator" />

      <main className="py-20 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        <AppHeader
          desc="Type your business description in the field below and wait for your user groups to be generated."
          title="Liferay User Group Generator"
        />

        <form onSubmit={onSubmit}>
          <div className="w-700 grid grid-cols-2 gap-2 sm:grid-cols-2 md:gap-4 mb-5">
            <FieldString
              defaultValue="Job Placement Services and Training"
              inputChange={setOrganizationTopicInput}
              label="Business Description"
              name="companytopic"
              placeholder="Enter a business description"
            />

            <FieldString
              defaultValue="10"
              inputChange={setUserGroupNumberInput}
              label="Prefered Number of User Groups"
              name="numberOfUserGroups"
              placeholder="Enter a the number of user groups to generate"
            />
          </div>

          <FieldSubmit disabled={isLoading} label="Generate User Group" />
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
