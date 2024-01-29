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
  const [wikiArticleLengthInput, setWikiPageLengthInput] = useState('60');
  const [wikiChildPageNumberInput, setWikiChildPageNumberInput] = useState('3');
  const [wikiPageNumberInput, setWikiPageNumberInput] = useState('3');
  const [wikiNodeNameInput, setWikiNodeNameInput] = useState('Healthy Living');
  const [wikiTopicInput, setWikiTopicInput] = useState('Healthy Living Advice and Tips');
  const [result, setResult] = useState(() => '');
  const [siteIdInput, setSiteIdInput] = useState('');

  const [viewOptionsInput, setViewOptionsSelect] = useState('Anyone');
  const viewOptions = functions.getViewOptions();

  const [appConfig, setAppConfig] = useState({
    model:functions.getDefaultAIModel()
  });

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    const response = await fetch('/api/wikis', {
      body: JSON.stringify({
        config: appConfig,
        wikiArticleLength: wikiArticleLengthInput,
        wikiPageNumber: wikiPageNumberInput,
        wikiChildPageNumber: wikiChildPageNumberInput,
        wikiTopic: wikiTopicInput,
        siteId: siteIdInput,
        wikiNodeName: wikiNodeNameInput,
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
      <AppHead title={'Wiki Content Generator'} />

      <main className="py-20 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        <AppHeader
          desc={
            'Type your topic in the field below and wait for your wiki pages. Examples of wiki topics are "company policies and procedures", "environmental issues and sustainability", or "economics and business".'
          }
          title={'Liferay Wiki Content Generator'}
        />

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:gap-4 mb-5">
            <FieldString
              defaultValue="Healthy Living Advice and Tips"
              inputChange={setWikiTopicInput}
              label="Wiki Topic"
              name="wikiTopic"
              placeholder="Enter a wiki topic"
            />

            <FieldString
              defaultValue="Healthy Living"
              inputChange={setWikiNodeNameInput}
              label="Wiki Node Name"
              name="wikiNodeName"
              placeholder="Enter a wiki node name"
            />

            <FieldString
              defaultValue=""
              inputChange={setSiteIdInput}
              label="Site ID"
              name="siteId"
              placeholder="Enter a site ID"
            />

            <FieldString
              defaultValue="60"
              inputChange={setWikiPageLengthInput}
              label="Expected Page Length (in # of words)"
              name="wikiArticleLength"
              placeholder="Enter a wiki article length"
            />

            <FieldString
              defaultValue="3"
              inputChange={setWikiPageNumberInput}
              label="Number of Pages to Create"
              name="wikiPageNumber"
              placeholder="Number of of wiki sections"
            />

            <FieldString
              defaultValue="3"
              inputChange={setWikiChildPageNumberInput}
              label="Number of Child Pages per Page"
              name="wikiChildPageNumber"
              placeholder="Number of of wiki child pages"
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
            label="Generate Wiki Node and Pages"
          />
        </form>

        {isLoading ? (
          <LoadingAnimation />
        ) : (
          result && <ResultDisplay result={result} />
        )}
      </main>

      <AppFooter setConfig={setAppConfig}/>
    </div>
  );
}
