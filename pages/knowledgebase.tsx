import hljs from 'highlight.js';
import { useState } from 'react';
import React from 'react';

import FieldSelect from '../components/formfield-select';
import FieldString from '../components/formfield-string';
import FieldSubmit from '../components/formfield-submit';
import Layout from '../components/layout';
import LoadingAnimation from '../components/loadinganimation';
import ResultDisplay from '../components/resultdisplay';
import functions from '../utils/functions';

export default function KnowledgeBase() {
  const [isLoading, setIsLoading] = useState(false);
  const [kbArticleLengthInput, setKBArticleLengthInput] = useState('100');
  const [kbArticleNumberInput, setKBArticleNumberInput] = useState('4');
  const [kbFolderNumberInput, setKBFolderNumberInput] = useState('3');
  const [kbLanguageInput, setKBLanguageInput] = useState('en-US');
  const [kbTopicInput, setKBTopicInput] = useState('');
  const [result, setResult] = useState(() => '');
  const [siteIdInput, setSiteIdInput] = useState('');

  const languageOptions = functions.getAvailableLanguages();

  const [viewOptionsInput, setViewOptionsSelect] = useState('Anyone');
  const viewOptions = functions.getViewOptions();

  const [appConfig, setAppConfig] = useState({
    model: functions.getDefaultAIModel(),
  });

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    const response = await fetch('/api/knowledgebase', {
      body: JSON.stringify({
        config: appConfig,
        kbArticleLength: kbArticleLengthInput,
        kbArticleNumber: kbArticleNumberInput,
        kbFolderNumber: kbFolderNumberInput,
        kbLanguage: kbLanguageInput,
        kbTopic: kbTopicInput,
        siteId: siteIdInput,
        viewOptions: viewOptionsInput,
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
    <Layout
      description='Type your topic in the field below and wait for your Knowledge Base Threads. Examples of knowledge base topics are "dangerous material handling", "healthy living tips", or "creating a positive work environment".'
      setAppConfig={setAppConfig}
      title="Liferay Knowledge Base Content Generator"
    >
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
            label="Site ID"
            name="siteId"
            placeholder="Enter a site ID"
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
            name="kbSectionNumber"
            placeholder="Number of of knowledge base sections"
          />

          <FieldString
            defaultValue="4"
            inputChange={setKBArticleNumberInput}
            label="Number of Articles to Create per Section"
            name="kbNumber"
            placeholder="Number of of knowledge base sections"
          />

          <FieldSelect
            inputChange={setKBLanguageInput}
            label="Knowledge Base Language"
            name="kbLanguage"
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
          label="Generate Knowledge Base Articles"
        />
      </form>

      {isLoading ? (
        <LoadingAnimation />
      ) : (
        result && <ResultDisplay result={result} />
      )}
    </Layout>
  );
}
