import hljs from 'highlight.js';
import { useEffect, useState } from 'react';
import React from 'react';

import AppFooter from './components/appfooter';
import AppHead from './components/apphead';
import AppHeader from './components/appheader';
import FieldImageType from './components/formfield-imagetype';
import FieldString from './components/formfield-string';
import FieldSubmit from './components/formfield-submit';
import ImageStyle from './components/imagestyle';
import LoadingAnimation from './components/loadinganimation';
import ResultDisplay from './components/resultdisplay';

export default function Review() {
  const [blogTopicInput, setBlogTopicInput] = useState('');
  const [blogNumberInput, setBlogNumberInput] = useState('3');
  const [blogLengthInput, setBlogLengthInput] = useState('200');
  const [siteIdInput, setSiteIdInput] = useState('');
  const [imageGenerationType, setImageGenerationType] = useState('none');
  const [showStyleInput, setShowImageStyleInput] = useState(false);
  const [imageStyleInput, setImageStyleInput] = useState('');
  const [submitLabel, setSubmitLabel] = useState('');

  const [result, setResult] = useState(() => '');
  const [isLoading, setIsLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  const onDebugModeChange = (value) => {
    setDebugMode(value);
  };

  const onImageStyleInputChange = (value) => {
    setImageStyleInput(value);
  };

  const USDollar = new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  });

  useEffect(() => {
    updateCost();
  }, [blogNumberInput, imageGenerationType]);

  const updateCost = () => {
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
        blogTopic: blogTopicInput,
        debugMode: debugMode,
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
    if (debugMode) console.log('data', data);

    const hljsResult = hljs.highlightAuto(data.result).value;
    setResult(hljsResult);

    setIsLoading(false);
  }

  return (
    <div>
      <AppHead title="Blog Generator" />

      <main className="py-20 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        <AppHeader
          desc={
            'Type your topic in the field below and wait for your blogs. <br/> Leave the field blank for a random blog topic.'
          }
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

            <FieldImageType includeNone inputChange={setImageGenerationType} />

            {showStyleInput && (
              <ImageStyle styleInputChange={onImageStyleInputChange} />
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

      <AppFooter debugModeChange={onDebugModeChange} />
    </div>
  );
}
