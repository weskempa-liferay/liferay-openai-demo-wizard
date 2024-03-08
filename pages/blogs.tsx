import hljs from 'highlight.js';
import { useEffect, useState } from 'react';
import React from 'react';

import FieldImageType from '../components/formfield-imagetype';
import FieldSelect from '../components/formfield-select';
import FieldString from '../components/formfield-string';
import FieldSubmit from '../components/formfield-submit';
import ImageStyle from '../components/imagestyle';
import Layout from '../components/layout';
import LoadingAnimation from '../components/loadinganimation';
import ResultDisplay from '../components/resultdisplay';
import functions from '../utils/functions';
import { logger } from '../utils/logger';

const debug = logger('Blogs');

export default function Blogs() {
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

  const [viewOptionsInput, setViewOptionsSelect] = useState('Anyone');
  const viewOptions = functions.getViewOptions();

  const [appConfig, setAppConfig] = useState({
    model: functions.getDefaultAIModel(),
  });

  const languageOptions = functions.getAvailableLanguages();

  useEffect(() => {

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

    updateCost();
  }, [blogNumberInput, imageGenerationType]);


  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    const response = await fetch('/api/blogs', {
      body: JSON.stringify({
        blogLanguage: blogLanguageInput,
        blogLength: blogLengthInput,
        blogNumber: blogNumberInput,
        blogTopic: blogTopicInput,
        config: appConfig,
        imageGeneration: imageGenerationType,
        imageStyle: imageStyleInput,
        siteId: siteIdInput,
        viewOptions: viewOptionsInput,
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
    <Layout
      description={`Type your topic in the field below and wait for your blogs. Examples of blog topics are "leadership skills and lessons learned", "aerospace engineering news", or "technology advancements in the medical field".`}
      setAppConfig={setAppConfig}
      title="Liferay Blog Generator"
    >
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

          <FieldSelect
            inputChange={setViewOptionsSelect}
            label="View Options"
            name="viewOption"
            optionMap={viewOptions}
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
    </Layout>
  );
}
