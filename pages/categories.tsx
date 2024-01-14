import hljs from 'highlight.js';
import { useState } from 'react';
import React from 'react';

import AppFooter from './components/appfooter';
import AppHead from './components/apphead';
import AppHeader from './components/appheader';
import FieldLanguage from './components/formfield-language';
import FieldString from './components/formfield-string';
import FieldSubmit from './components/formfield-submit';
import LoadingAnimation from './components/loadinganimation';
import ResultDisplay from './components/resultdisplay';
import { logger } from './utils/logger';

const debug = logger('Categories');

export default function Categories() {
  const [siteIdInput, setSiteIdInput] = useState('');
  const [vocabularyDescriptionInput, setVocabularyDescriptionInput] =
    useState('Various categories of books');
  const [vocabularyNameInput, setVocabularyNameInput] =
    useState('Books types');
  const [categorytNumberInput, setCategorytNumberInput] = useState('5');
  const [childCategorytNumberInput, setChildCategorytNumberInput] =
    useState('3');
  const [languagesInput, setLanguages] = useState([]);
  const [manageLanguageInput, setManageLanguage] = useState(false);
  const [defaultLanguageInput, setDefaultLanguage] = useState('en-US');

  const [result, setResult] = useState(() => '');
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    debug('Posting!');

    const response = await fetch('/api/categories', {
      body: JSON.stringify({
        categorytNumber: categorytNumberInput,
        childCategorytNumber: childCategorytNumberInput,
        defaultLanguage: defaultLanguageInput,
        siteId: siteIdInput,
        languages: languagesInput,
        manageLanguage: manageLanguageInput,
        vocabularyName: vocabularyNameInput,
        vocabularyDescription: vocabularyDescriptionInput
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
    <div>
      <AppHead title="Account Generator" />

      <main className="py-20 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        <AppHeader
          desc={
            'Type your business description in the field below and wait for your categories.'
          }
          title="Liferay Category Generator"
        />

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:gap-4 mb-5">

          <FieldString
              defaultValue="Various categories of books"
              inputChange={setVocabularyDescriptionInput}
              label="Vocabulary Theme"
              name="vocabularyDescription"
              placeholder="Enter a vocabulary description"
            />

            <FieldString
              defaultValue="Book types"
              inputChange={setVocabularyNameInput}
              label="Vocabulary Name"
              name="vocabulary"
              placeholder="Enter a vocabulary name"
            />

            <FieldString
              defaultValue=""
              inputChange={setSiteIdInput}
              label="Site ID or Asset Library Group ID"
              name="siteId"
              placeholder="Enter a site ID or asset library group ID"
            />

            <FieldString
              defaultValue="5"
              inputChange={setCategorytNumberInput}
              label="Number of Categories"
              name="numberOfCategories"
              placeholder="Enter a the number of categories to generate"
            />

            <FieldString
              defaultValue="3"
              inputChange={setChildCategorytNumberInput}
              label="Prefered Number of Child Categories"
              name="numberOfChildCategories"
              placeholder="Enter a the number of child categories to generate"
            />
          </div>

          <FieldLanguage
            defaultLanguageChange={setDefaultLanguage}
            languagesChange={setLanguages}
            manageLanguageChange={setManageLanguage}
          />

          <FieldSubmit disabled={isLoading} label={'Generate Categories'} />
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
