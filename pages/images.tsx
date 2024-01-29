import hljs from 'highlight.js';
import { useEffect, useState } from 'react';

import functions from './utils/functions';
import AppFooter from './components/appfooter';
import AppHead from './components/apphead';
import AppHeader from './components/appheader';
import FieldImageType from './components/formfield-imagetype';
import FieldString from './components/formfield-string';
import FieldSubmit from './components/formfield-submit';
import ImageStyle from './components/imagestyle';
import LoadingAnimation from './components/loadinganimation';
import ResultDisplay from './components/resultdisplay';
import { logger } from './utils/logger';

const debug = logger('Images');

export default function Images() {
  const [imageDescriptionInput, setImageDescriptionInput] = useState('');
  const [imageFolderIdInput, setImageFolderIdInput] = useState('');
  const [imageGenerationType, setImageGenerationType] = useState('none');
  const [imageNumberInput, setImageNumberInput] = useState('1');
  const [imageStyleInput, setImageStyleInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [showStyleInput, setShowImageStyleInput] = useState(false);
  const [submitLabel, setSubmitLabel] = useState('');

  const [appConfig, setAppConfig] = useState({
    model:functions.getDefaultAIModel()
  });

  let USDollar = new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  });

  useEffect(() => {
    updateCost();
  }, [imageNumberInput, imageGenerationType]);

  const updateCost = () => {
    setShowImageStyleInput(false);
    let cost = '';

    if (isNaN(parseInt(imageNumberInput))) {
      cost = '$0.00';
    } else if (imageGenerationType == 'dall-e-3') {
      setShowImageStyleInput(true);
      cost = USDollar.format(parseInt(imageNumberInput) * 0.04);
    } else if (imageGenerationType == 'dall-e-2') {
      setShowImageStyleInput(false);
      cost = USDollar.format(parseInt(imageNumberInput) * 0.02);
    } else {
      cost = '<$0.01';
    }

    setSubmitLabel('Generate Images - Estimated cost: ' + cost);
  };

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    const response = await fetch('/api/images', {
      body: JSON.stringify({
        config: appConfig,
        imageDescription: imageDescriptionInput,
        imageFolderId: imageFolderIdInput,
        imageGeneration: imageGenerationType,
        imageNumber: imageNumberInput,
        imageStyle: imageStyleInput,
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
      <AppHead title={'Image Generator'} />

      <main className="py-20 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        <AppHeader
          desc={'Type your topic in the field below and wait for your images.'}
          title={'Liferay Image Generator'}
        />

        <form onSubmit={onSubmit}>
          <div className="w-700 grid grid-cols-1 gap-2 sm:grid-cols-1 md:gap-4 mb-5">
            <FieldString
              defaultValue=''
              inputChange={setImageDescriptionInput}
              label='Enter an Image Description'
              name='imageDescription'
              placeholder={
                'Provide a detailed description of the image(s) you want to generate.'
              }
            />

            {showStyleInput && (
              <ImageStyle styleInputChange={setImageStyleInput} />
            )}
          </div>

          <div className="w-700 grid grid-cols-2 gap-2 sm:grid-cols-2 md:gap-4 mb-5">
            <FieldString
              defaultValue="1"
              inputChange={setImageNumberInput}
              label="Number of Images to Generate (Max 10)"
              name="imageNumber"
              placeholder="Number of images"
            />

            <FieldString
              defaultValue=""
              inputChange={setImageFolderIdInput}
              label="Image Folder ID"
              name="imageFolderId"
              placeholder="Enter a Document Library Folder ID"
            />

            <FieldImageType
              includeNone={false}
              inputChange={setImageGenerationType}
            />
          </div>

          <FieldSubmit disabled={isLoading} label={submitLabel} />
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
