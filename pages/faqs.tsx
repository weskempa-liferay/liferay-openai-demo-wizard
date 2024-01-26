import hljs from 'highlight.js';
import { useState } from 'react';
import React from 'react';

import AppFooter from './components/appfooter';
import AppHead from './components/apphead';
import AppHeader from './components/appheader';
import TopNavItem from './components/apptopnavitem';
import FieldLangauge from './components/formfield-language';
import FieldString from './components/formfield-string';
import FieldSubmit from './components/formfield-submit';
import FieldSelect from './components/formfield-select';
import LoadingAnimation from './components/loadinganimation';
import ResultDisplay from './components/resultdisplay';
import { logger } from './utils/logger';
import functions from './utils/functions';

const debug = logger('faqs');

export default function Faqs() {
  const [faqTopicInput, setFAQTopicInput] = useState('');
  const [siteIdInput, setSiteIdInput] = useState('');
  const [faqNumberInput, setFAQNumberInput] = useState('5');
  const [faqFolderIdInput, setFAQFolderIdInput] = useState('0');
  const [faqStructureIdInput, setFAQStructureIdInput] = useState('');
  const [categoryIdsInput, setCategoryIdsInput] = useState('');

  const [viewOptionsInput, setViewOptionsSelect] = useState('Anyone');
  const viewOptions = functions.getViewOptions();

  const [languagesInput, setLanguages] = useState([]);
  const [manageLanguageInput, setManageLanguage] = useState(false);
  const [defaultLanguageInput, setDefaultLanguage] = useState('en-US');

  const [result, setResult] = useState(() => '');
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    debug('Posting...');
    debug(
      `languagesInput ${languagesInput}, manageLanguageInput ${manageLanguageInput}, defaultLaguagesInput ${defaultLanguageInput}`
    );

    const response = await fetch('/api/faqs', {
      body: JSON.stringify({
        categoryIds: categoryIdsInput,
        defaultLanguage: defaultLanguageInput,
        faqNumber: faqNumberInput,
        faqTopic: faqTopicInput,
        folderId: faqFolderIdInput,
        languages: languagesInput,
        viewOptions: viewOptionsInput,
        manageLanguage: manageLanguageInput,
        siteId: siteIdInput,
        structureId: faqStructureIdInput,
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

  const handleStructureClick = () => {
    downloadFile({
      fileName: 'Structure-Frequently_Asked_Question.json',
      filePath: 'faqs/Structure-Frequently_Asked_Question.json',
    });
  };

  const downloadFile = ({ fileName, filePath }) => {
    const a = document.createElement('a');
    a.download = fileName;
    a.href = filePath;
    const clickEvt = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    a.dispatchEvent(clickEvt);
    a.remove();
  };

  const handleFragmentClick = () => {
    location.href = 'faqs/Fragment-FAQ.zip';
  };

  return (
    <div>
      <AppHead title="FAQ Generator" />

      <main className="py-20 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        <AppHeader
          desc='Type your topic in the field below and wait for your FAQs. Examples of FAQ topics are "budget planning", "starting a manufacturing company", or "practical uses of sodium bicarbonate".'
          title='Liferay FAQ Generator'
        />

        <div className="fixed top-2 right-5 p-5 text-lg download-options rounded">
          <TopNavItem label="FAQ Structure" onClick={handleStructureClick} />

          <TopNavItem label="FAQ Fragment" onClick={handleFragmentClick} />
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:gap-4 mb-5">
            <FieldString
              defaultValue=""
              inputChange={setFAQTopicInput}
              label="FAQ Topic"
              name="topic"
              placeholder="Enter a FAQ Topic"
            />

            <FieldString
              defaultValue="5"
              inputChange={setFAQNumberInput}
              label="Number of Q&A Pairs to Create"
              name="faqNumber"
              placeholder="Number of FAQs"
            />

            <FieldString
              defaultValue=""
              inputChange={setSiteIdInput}
              label="Site ID or Asset Library Group ID"
              name="siteId"
              placeholder="Enter a site ID or asset library group ID"
            />

            <FieldString
              defaultValue=""
              inputChange={setFAQStructureIdInput}
              label="FAQ Structure ID"
              name="faqStructureID"
              placeholder="Enter the FAQ structure ID"
            />

            <FieldString
              defaultValue="0"
              inputChange={setFAQFolderIdInput}
              label="Web Content Folder ID (0 for Root)"
              name="folderId"
              placeholder="Enter a folder ID"
            />

            <FieldSelect
              inputChange={setViewOptionsSelect}
              label="View Options"
              name="viewOption"
              optionMap={viewOptions}
            />

            <FieldString
              defaultValue=""
              inputChange={setCategoryIdsInput}
              label="Comma-Delimited Category IDs (Optional)"
              name="categoryIds"
              placeholder="List of comma-delimited category IDs"
            />
          </div>

          <FieldLangauge
            defaultLanguageChange={setDefaultLanguage}
            languagesChange={setLanguages}
            manageLanguageChange={setManageLanguage}
          />

          <FieldSubmit disabled={isLoading} label={'Generate FAQs'} />
        </form>

        <p className="text-slate-100 text-center text-lg mb-3 rounded p-5 bg-white/10 italic">
          <b>Note:</b> FAQ generation requires a specific content structure.{' '}
          <br />
          Please use the supplied FAQ Structure and Fragment supplied above.
        </p>

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
