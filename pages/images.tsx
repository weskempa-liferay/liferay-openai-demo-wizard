import hljs from 'highlight.js';
import { useEffect, useState } from 'react';

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

const debug = logger('Images');

export default function Images() {
  const [imageDescriptionInput, setImageDescriptionInput] = useState('');
  const [imageFolderIdInput, setImageFolderIdInput] = useState('');
  const [imageGenerationType, setImageGenerationType] = useState('dall-e-3');
  const [imageGenerationSize, setImageGenerationSize] = useState('1024x1024');
  const [imageGenerationQuality, setImageGenerationQuality] =
    useState('standard');
  const [imageNumberInput, setImageNumberInput] = useState('1');
  const [imageStyleInput, setImageStyleInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [showStyleInput, setShowImageStyleInput] = useState(true);
  const [submitLabel, setSubmitLabel] = useState('');

  const [dalliOptions, setDalliOptions] = useState([]);

  const [appConfig, setAppConfig] = useState({
    model: functions.getDefaultAIModel(),
  });

  let USDollar = new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  });

  useEffect(() => {

    const updateCost = () => {
      let cost = '';

      let imageSizeCost = getImageSizeCost(
        imageGenerationType,
        imageGenerationSize + '-' + imageGenerationQuality
      );

      if (isNaN(parseInt(imageNumberInput))) {
        cost = '$0.00';
      } else if (
        imageGenerationType == 'dall-e-3' ||
        imageGenerationType == 'dall-e-2'
      ) {
        cost = USDollar.format(parseInt(imageNumberInput) * imageSizeCost);
      } else {
        cost = '$0.02';
      }

      setSubmitLabel('Generate Images - Estimated cost: ' + cost);
    };
    
    updateCost();
  }, [
    imageGenerationType,
    imageGenerationSize,
    imageGenerationQuality,
    imageNumberInput,
  ]);

  useEffect(() => {
    setDalliOptions(functions.getD3ImageSizeOptions());
  }, []);

  const handleSetImageGenerationType = (value) => {
    setImageGenerationType(value);
    setImageGenerationSize('1024x1024');
    setImageGenerationQuality('standard');

    if (value == 'dall-e-2') {
      setShowImageStyleInput(false);
      setDalliOptions(functions.getD2ImageSizeOptions());
    } else if (value == 'dall-e-3') {
      setShowImageStyleInput(true);
      setDalliOptions(functions.getD3ImageSizeOptions());
    }
  };

  const handleSetImageGenerationParams = (value) => {
    setImageGenerationSize(value.split('-')[0]);
    setImageGenerationQuality(value.split('-')[1]);
  };

  const getImageSizeCost = (type, size) => {
    let imgCost = 0.02;
    let options = functions.getD2ImageSizeOptions();

    if (type == 'dall-e-3') options = functions.getD3ImageSizeOptions();

    for (let i = 0; i < options.length; i++) {
      if (options[i].id == size) {
        return options[i].cost;
      }
    }

    return imgCost;
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
        imageGenerationQuality: imageGenerationQuality,
        imageGenerationSize: imageGenerationSize,
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
    <Layout
      description="Type your topic in the field below and wait for your images."
      setAppConfig={setAppConfig}
      title="Liferay Image Generator"
    >
      <form onSubmit={onSubmit}>
        <div className="w-700 grid grid-cols-1 gap-2 sm:grid-cols-1 md:gap-4 mb-5">
          <FieldString
            defaultValue=""
            inputChange={setImageDescriptionInput}
            label="Enter an Image Description"
            name="imageDescription"
            placeholder={
              'Provide a detailed description of the image(s) you want to generate.'
            }
          />
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
            inputChange={handleSetImageGenerationType}
          />

          <FieldSelect
            inputChange={handleSetImageGenerationParams}
            label="Image Size"
            name="imageSize"
            optionMap={dalliOptions}
          />

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
