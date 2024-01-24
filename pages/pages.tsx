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
  const [pageTopicInput, setPageTopicInput] = useState(
    'Company Intranet Portal'
  );
  const [childPagetNumberInput, setChildPagetNumberInput] =
    useState('3');
  const [departmentNumberInput, setPageNumberInput] = useState('3');
  const [siteIdInput, setSiteIdInput] = useState('3');

  const [result, setResult] = useState(() => '');
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    const response = await fetch('/api/pages', {
      body: JSON.stringify({
        pageTopic: pageTopicInput,
        siteId:siteIdInput,
        childPagetNumber: childPagetNumberInput,
        departmentNumber: departmentNumberInput,
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
      <AppHead title="Page Generator" />

      <main className="py-20 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        <AppHeader
          desc="Type your business description in the field below and wait for your pages."
          title="Liferay Page Generator"
        />

        <form onSubmit={onSubmit}>
          <div className="w-700 grid grid-cols-2 gap-2 sm:grid-cols-2 md:gap-4 mb-5">
            <FieldString
              defaultValue="Company Intranet Portal"
              inputChange={setPageTopicInput}
              label="Site Description"
              name="sitetopic"
              placeholder="Enter a site description"
            />

            <FieldString
              defaultValue=""
              inputChange={setSiteIdInput}
              label="Site Id"
              name="siteId"
              placeholder="Enter id of the site that you would like to add pages to"
            />

            <FieldString
              defaultValue="3"
              inputChange={setPageNumberInput}
              label="Maximum Number of Pages"
              name="numberOfPages"
              placeholder="Enter a the max number of top level pages to generate"
            />

            <FieldString
              defaultValue="3"
              inputChange={setChildPagetNumberInput}
              label="Maximum Number of Child Pages"
              name="numberOfChildPages"
              placeholder="Enter a the max number of child pages to generate"
            />

          </div>

          <FieldSubmit disabled={isLoading} label="Generate Pages" />
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
