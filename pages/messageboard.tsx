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

export default function MessageBoard() {
  const [mbTopicInput, setMBTopicInput] = useState('');
  const [mbThreadLengthInput, setMBThreadLengthInput] = useState('50');
  const [siteIdInput, setSiteIdInput] = useState('');
  const [mbSectionNumberInput, setMBSectionNumberInput] = useState('3');
  const [mbThreadNumberInput, setMBThreadNumberInput] = useState('3');
  const [mbMessageNumberInput, setMBMessageNumberInput] = useState('2');
  const [mbLanguageInput, setMBLanguageInput] = useState('en-US');

  const [viewOptionsInput, setViewOptionsSelect] = useState('Anyone');
  const viewOptions = functions.getViewOptions();

  const [result, setResult] = useState(() => '');
  const [isLoading, setIsLoading] = useState(false);

  const languageOptions = functions.getAvailableLanguages();

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    const response = await fetch('/api/messageboard', {
      body: JSON.stringify({
        mbMessageNumber: mbMessageNumberInput,
        mbSectionNumber: mbSectionNumberInput,
        mbThreadLength: mbThreadLengthInput,
        mbThreadNumber: mbThreadNumberInput,
        mbLanguage: mbLanguageInput,
        mbTopic: mbTopicInput,
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
      <AppHead title="Mesage Board Content Generator" />

      <main className="py-20 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        <AppHeader
          desc={
            'Type your topic in the field below and wait for your Message Board Threads. <br/> Leave the field blank for a random Message Board topic.'
          }
          title={'Liferay Message Board Content Generator'}
        />

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:gap-4 mb-5">
            <FieldString
              defaultValue=""
              inputChange={setMBTopicInput}
              label="Message Board Topic"
              name="topic"
              placeholder="Enter a message board topic"
            />

            <FieldString
              defaultValue=""
              inputChange={setSiteIdInput}
              label="Site ID or Asset Library Group ID"
              name="siteId"
              placeholder="Enter a site ID or asset library group ID"
            />

            <FieldString
              defaultValue="50"
              inputChange={setMBThreadLengthInput}
              label="Expected Thread Length (in # of words)"
              name="threadLength"
              placeholder="Enter a message board thread length"
            />

            <FieldString
              defaultValue="3"
              inputChange={setMBSectionNumberInput}
              label="Number of Sections to Create"
              name="mbNumber"
              placeholder="Number of message board sections"
            />

            <FieldString
              defaultValue="3"
              inputChange={setMBThreadNumberInput}
              label="Number of Threads to Create per Section"
              name="mbThreadNumber"
              placeholder="Message board threads per section"
            />

            <FieldString
              defaultValue="2"
              inputChange={setMBMessageNumberInput}
              label="Number of Messages to Create per Thread"
              name="mbMessagesNumber"
              placeholder="Message board messages per thread"
            />
            
            <FieldSelect
              inputChange={setMBLanguageInput}
              label="Blog Language"
              name="blogLanguage"
              optionMap={languageOptions}
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
            label={'Generate Message Board Threads'}
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
