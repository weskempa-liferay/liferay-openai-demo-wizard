import hljs from 'highlight.js';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import FieldSubmit from '../components/formfield-submit';
import Form from '../components/forms/form';
import Input from '../components/forms/input';
import Select from '../components/forms/select';
import ImageStyle from '../components/imagestyle';
import Layout from '../components/layout';
import LoadingAnimation from '../components/loadinganimation';
import ResultDisplay from '../components/resultdisplay';
import schema, { z, zodResolver } from '../schemas/zod';
import nextAxios from '../services/next';
import { USDollar } from '../utils/currency';
import functions from '../utils/functions';

type ImageSchema = z.infer<typeof schema.image>;

const getImageSizeCost = (type, size) => {
  let imageCost = 0.02;
  let options = functions.getD2ImageSizeOptions();

  if (type == 'dall-e-3') options = functions.getD3ImageSizeOptions();

  for (let i = 0; i < options.length; i++) {
    if (options[i].id == size) {
      return options[i].cost;
    }
  }

  return imageCost;
};

export default function Images() {
  const imageForm = useForm<ImageSchema>({
    defaultValues: {
      imageGeneration: 'dall-e-3',
      imageGenerationQuality: 'standard',
      imageGenerationSize: '1024x1024',
      imageNumber: '1',
    },
    resolver: zodResolver(schema.image),
  });

  const [result, setResult] = useState('');

  const {
    formState: { isSubmitting },
    setValue,
    watch,
  } = imageForm;

  const imageGeneration = watch('imageGeneration');
  const imageGenerationQuality = watch('imageGenerationQuality');
  const imageGenerationSize = watch('imageGenerationSize');
  const imageNumber = watch('imageNumber');

  const { dalliOptions, showImageStyle, submitLabel } = useMemo(() => {
    let cost = '';
    let dalliOptions = functions.getD3ImageSizeOptions();
    let showImageStyle = false;

    if (imageGeneration == 'dall-e-2') {
      dalliOptions = functions
        .getD2ImageSizeOptions()
        .map((image) => ({ ...image, id: image.id.replace('-standard', '') }));
    } else if (imageGeneration == 'dall-e-3') {
      dalliOptions = functions.getD3ImageSizeOptions();
      showImageStyle = true;
    }

    let imageSizeCost = getImageSizeCost(
      imageGeneration,
      imageGenerationSize + '-' + imageGenerationQuality
    );

    if (isNaN(parseInt(imageNumber))) {
      cost = '$0.00';
    } else if (imageGeneration == 'dall-e-3' || imageGeneration == 'dall-e-2') {
      cost = USDollar.format(parseInt(imageNumber) * imageSizeCost);
    } else {
      cost = '$0.02';
    }

    return {
      dalliOptions,
      showImageStyle,
      submitLabel: 'Generate Images - Estimated cost: ' + cost,
    };
  }, [
    imageGeneration,
    imageGenerationQuality,
    imageGenerationSize,
    imageNumber,
  ]);

  async function onSubmit(payload: ImageSchema) {
    const { data } = await nextAxios.post('/api/images', payload);

    const hljsResult = hljs.highlightAuto(data.result).value;

    setResult(hljsResult);
  }

  return (
    <Layout
      description="Type your topic in the field below and wait for your images."
      title="Liferay Image Generator"
    >
      <Form
        formProviderProps={imageForm}
        onSubmit={imageForm.handleSubmit(onSubmit)}
      >
        <div className="w-700 grid grid-cols-1 gap-2 sm:grid-cols-1 md:gap-4 mb-5">
          <Input
            label="Enter an Image Description"
            name="imageDescription"
            placeholder="Provide a detailed description of the image(s) you want to generate."
          />
        </div>

        <div className="w-700 grid grid-cols-2 gap-2 sm:grid-cols-2 md:gap-4 mb-5">
          <Input
            label="Number of Images to Generate (Max 10)"
            name="imageNumber"
            placeholder="Number of images"
          />

          <Input
            label="Image Folder ID"
            name="imageFolderId"
            placeholder="Enter a Document Library Folder ID"
          />

          <Select
            label="Image Generation"
            name="imageGeneration"
            optionMap={[
              { id: 'none', name: 'None' },
              { id: 'dall-e-3', name: 'DALL·E 3 (Highest-Quality Images)' },
              { id: 'dall-e-2', name: 'DALL·E 2 (Basic Images)' },
            ]}
          />

          <Select
            label="Image Size"
            name="imageGenerationSize"
            optionMap={dalliOptions}
          />

          {showImageStyle && (
            <ImageStyle
              styleInputChange={(newValue: string) =>
                setValue('imageStyle', newValue)
              }
            />
          )}
        </div>

        <FieldSubmit 
          disabled={!imageForm.formState.isValid || isSubmitting}
          label={submitLabel} />
      </Form>

      {isSubmitting ? (
        <LoadingAnimation />
      ) : (
        result && <ResultDisplay result={result} />
      )}
    </Layout>
  );
}
