import hljs from 'highlight.js';
import { useEffect, useState } from 'react';
import React from 'react';

import functions from './utils/functions';
import AppFooter from './components/appfooter';
import AppHead from './components/apphead';
import AppHeader from './components/appheader';
import FieldImageType from './components/formfield-imagetype';
import FieldString from './components/formfield-string';
import FieldSelect from './components/formfield-select';
import FieldSubmit from './components/formfield-submit';
import ImageStyle from './components/imagestyle';
import LoadingAnimation from './components/loadinganimation';
import ResultDisplay from './components/resultdisplay';
import { logger } from './utils/logger';

const debug = logger('Blogs');

export default function Review() {
  const [blogLengthInput, setBlogLengthInput] = useState('200');
  const [blogNumberInput, setBlogNumberInput] = useState('3');
  const [blogTopicInput, setBlogTopicInput] = useState('');
  const [blogLanguageInput, setBlogLanguageInput] = useState('en-US');
  const [imageGenerationType, setImageGenerationType] = useState('none');
  const [imageStyleInput, setImageStyleInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [showStyleInput, setShowImageStyleInput] = useState(false);
  const [siteIdInput, setSiteIdInput] = useState('');
  const [submitLabel, setSubmitLabel] = useState('');

  const languageOptions = functions.getAvailableLanguages();

  useEffect(() => {
    updateCost();
  }, [blogNumberInput, imageGenerationType]);

  const updateCost = () => {
    const USDollar = new Intl.NumberFormat('en-US', {
      currency: 'USD',
      style: 'currency',
    });

    setShowImageStyleInput(false);

    let cost = '';

    if (isNaN(parseInt(blogNumberInput))) {
      cost = '$0.00';
    } else if (imageGenerationType == 'dall-e-3') {
      setShowImageStyleInput(true);
      cost = USDollar.format(parseInt(blogNumberInput) * 0.04);
    } else if (imageGenerationType == 'dall-e-2') {
      cost = USDollar.format(parseInt(blogNumberInput) * 0.02);
    } else {
      cost = '<$0.01';
    }

    setSubmitLabel('Generate Blogs - Estimated cost: ' + cost);
  };

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    const response = await fetch('/api/blogs', {
      body: JSON.stringify({
        blogLength: blogLengthInput,
        blogNumber: blogNumberInput,
        blogLanguage: blogLanguageInput,
        blogTopic: blogTopicInput,
        imageGeneration: imageGenerationType,
        imageStyle: imageStyleInput,
        siteId: siteIdInput,
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
      <AppHead title="Blog Generator" />

      <main className="py-20 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        <AppHeader
          desc="Type your topic in the field below and wait for your blogs. <br/> Leave the field blank for a random blog topic."
          title="Liferay Blog Generator"
        />

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:gap-4 mb-5">
            <FieldString
              defaultValue=""
              inputChange={setBlogTopicInput}
              label="Blog Topic"
              name="topic"
              placeholder="Enter a blog topic"
            />

            <FieldString
              defaultValue="3"
              inputChange={setBlogNumberInput}
              label="Number of Posts to Create (Max 10)"
              name="blogNumber"
              placeholder="Number of blog posts"
            />

            <FieldString
              defaultValue="200"
              inputChange={setBlogLengthInput}
              label="Expected Blog Post Length (in # of words)"
              name="blogLength"
              placeholder="Enter a the expected blog length"
            />

            <FieldString
              defaultValue=""
              inputChange={setSiteIdInput}
              label="Site ID or Asset Library Group ID"
              name="siteId"
              placeholder="Enter a site ID or asset library group ID"
            />
            
            <FieldSelect
              inputChange={setBlogLanguageInput}
              label="Blog Language"
              name="blogLanguage"
              optionMap={languageOptions}
            />

            <FieldImageType includeNone inputChange={setImageGenerationType} />

            {showStyleInput && (
              <ImageStyle styleInputChange={setImageStyleInput} />
            )}
          </div>

          <FieldSubmit disabled={isLoading} label={submitLabel} />
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
