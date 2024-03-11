import hljs from 'highlight.js';
import { useMemo, useState } from 'react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import FieldSubmit from '../components/formfield-submit';
import Form from '../components/forms/form';
import Input from '../components/forms/input';
import Select from '../components/forms/select';
import ImageStyle from '../components/imagestyle';
import Layout from '../components/layout';
import LoadingAnimation from '../components/loadinganimation';
import ResultDisplay from '../components/resultdisplay';
import schema, { zodResolver } from '../schemas/zod';
import nextAxios from '../services/next';
import { USDollar } from '../utils/currency';
import functions from '../utils/functions';

type BlogSchema = z.infer<typeof schema.blog>;

const languageOptions = functions.getAvailableLanguages();
const viewOptions = functions.getViewOptions();

export default function Blogs() {
  const [result, setResult] = useState('');

  const blogsForm = useForm<BlogSchema>({
    defaultValues: {
      blogLanguage: 'en-US',
      blogLength: '200',
      blogNumber: '3',
      imageGeneration: 'none',
      imageStyle: '',
      viewOptions: 'Anyone',
    },
    resolver: zodResolver(schema.blog),
  });

  const {
    formState: { isSubmitting },
    setValue,
    watch,
  } = blogsForm;

  const blogNumber = watch('blogNumber');
  const imageGeneration = watch('imageGeneration');

  const { showImageStyle, submitLabel } = useMemo(() => {
    let showImageStyle = false;

    let cost = '';

    if (isNaN(parseInt(blogNumber))) {
      cost = '$0.00';
    } else if (imageGeneration == 'dall-e-3') {
      showImageStyle = true;
      cost = USDollar.format(parseInt(blogNumber) * 0.04);
    } else if (imageGeneration == 'dall-e-2') {
      cost = USDollar.format(parseInt(blogNumber) * 0.02);
    } else {
      cost = '<$0.01';
    }

    return {
      showImageStyle,
      submitLabel: 'Generate Blogs - Estimated cost: ' + cost,
    };
  }, [blogNumber, imageGeneration]);

  async function onSubmit(payload: BlogSchema) {
    const { data } = await nextAxios.post('/api/blogs', payload);

    const hljsResult = hljs.highlightAuto(data.result).value;

    setResult(hljsResult);
  }

  return (
    <Layout
      description={`Type your topic in the field below and wait for your blogs. Examples of blog topics are "leadership skills and lessons learned", "aerospace engineering news", or "technology advancements in the medical field".`}
      title="Liferay Blog Generator"
    >
      <Form
        formProviderProps={blogsForm}
        onSubmit={blogsForm.handleSubmit(onSubmit)}
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:gap-4 mb-5">
          <Input
            label="Blog Topic"
            name="blogTopic"
            placeholder="Enter a blog topic"
          />

          <Input
            label="Number of Posts to Create (Max 10)"
            name="blogNumber"
            placeholder="Number of blog posts"
          />

          <Input
            label="Expected Blog Post Length (in # of words)"
            name="blogLength"
            placeholder="Enter a the expected blog length"
          />

          <Input
            label="Site ID or Asset Library Group ID"
            name="siteId"
            placeholder="Enter a site ID or asset library group ID"
          />

          <Select
            label="Blog Language"
            name="blogLanguage"
            optionMap={languageOptions}
          />

          <Select
            label="View Options"
            name="viewOption"
            optionMap={viewOptions}
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

          {showImageStyle && (
            <ImageStyle
              styleInputChange={(newValue: string) =>
                setValue('imageStyle', newValue)
              }
            />
          )}
        </div>

        <FieldSubmit disabled={isSubmitting} label={submitLabel} />
      </Form>

      {isSubmitting ? (
        <LoadingAnimation />
      ) : (
        result && <ResultDisplay result={result} />
      )}
    </Layout>
  );
}
