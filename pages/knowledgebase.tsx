import hljs from 'highlight.js';
import { useState } from 'react';
import React from 'react';

import functions from './utils/functions';
import AppFooter from './components/appfooter';
import AppHead from './components/apphead';
import AppHeader from './components/appheader';
import FieldString from './components/formfield-string';
import FieldSubmit from './components/formfield-submit';
import FieldSelect from './components/formfield-select';
import LoadingAnimation from './components/loadinganimation';
import ResultDisplay from './components/resultdisplay';

export default function Review() {
  const [isLoading, setIsLoading] = useState(false);
  const [kbArticleLengthInput, setKBArticleLengthInput] = useState('100');
  const [kbArticleNumberInput, setKBArticleNumberInput] = useState('4');
  const [kbFolderNumberInput, setKBFolderNumberInput] = useState('3');
  const [kbTopicInput, setKBTopicInput] = useState('');
  const [result, setResult] = useState(() => '');
  const [siteIdInput, setSiteIdInput] = useState('');

  const [viewOptionsInput, setViewOptionsSelect] = useState('Anyone');
  const viewOptions = functions.getViewOptions();

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    const response = await fetch('/api/knowledgebase', {
      body: JSON.stringify({
        kbArticleLength: kbArticleLengthInput,
        kbArticleNumber: kbArticleNumberInput,
        kbFolderNumber: kbFolderNumberInput,
        kbTopic: kbTopicInput,
        siteId: siteIdInput,
        viewOptions: viewOptionsInput
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
    const data = await response.json();

    const hljsResult = hljs.highlightAuto(data.result).value;
    setResult(hljsResult);

    setIsLoading(false);
  }

  return (
    <div>
      <AppHead title={'Knowledge Base Content Generator'} />

      <main className="py-20 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        <AppHeader
          desc={
            'Type your topic in the field below and wait for your Knowledge Base Threads. <br/> Leave the field blank for a random Knowledge Base topic.'
          }
          title={'Liferay Knowledge Base Content Generator'}
        />

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:gap-4 mb-5">
            <FieldString
              defaultValue=""
              inputChange={setKBTopicInput}
              label="Knowledge Base Topic"
              name="topic"
              placeholder="Enter a knowledge base topic"
            />

            <FieldString
              defaultValue=""
              inputChange={setSiteIdInput}
              label="Site ID or Asset Library Group ID"
              name="siteId"
              placeholder="Enter a site ID or asset library group ID"
            />

            <FieldString
              defaultValue="100"
              inputChange={setKBArticleLengthInput}
              label="Expected Article Length (in # of words)"
              name="articleLength"
              placeholder="Enter a knowledge base article length"
            />

            <FieldString
              defaultValue="3"
              inputChange={setKBFolderNumberInput}
              label="Number of Folders to Create"
              name="kbNumber"
              placeholder="Number of of knowledge base sections"
            />

            <FieldString
              defaultValue="4"
              inputChange={setKBArticleNumberInput}
              label="Number of Articles to Create per Section"
              name="kbSectionNumber"
              placeholder="Number of of knowledge base sections"
            />

            <FieldSelect
              inputChange={setViewOptionsSelect}
              label="View Options"
              name="viewOption"
              optionMap={viewOptions}
            />
          </div>

          <FieldSubmit
            disabled={isLoading}
            label="Generate Knowledge Base Articles"
          />
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
