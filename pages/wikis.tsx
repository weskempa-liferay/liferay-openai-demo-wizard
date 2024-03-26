import hljs from 'highlight.js';
import { useState } from 'react';
import React from 'react';
import { useForm } from 'react-hook-form';

import FieldSubmit from '../components/formfield-submit';
import Form from '../components/forms/form';
import Input from '../components/forms/input';
import Select from '../components/forms/select';
import Layout from '../components/layout';
import LoadingAnimation from '../components/loadinganimation';
import ResultDisplay from '../components/resultdisplay';
import schema, { z, zodResolver } from '../schemas/zod';
import nextAxios from '../services/next';
import functions from '../utils/functions';

type WikiSchema = z.infer<typeof schema.wiki>;

const viewOptions = functions.getViewOptions();

export default function Wikis() {
  const wikiForm = useForm<WikiSchema>({
    defaultValues: {
      siteId: '',
      viewOptions: viewOptions[0].id,
      wikiArticleLength: '60',
      wikiChildPageNumber: '3',
      wikiNodeName: 'Healthy Living',
      wikiPageNumber: '3',
      wikiTopic: 'Healthy Living Advice and Tips',
    },
    resolver: zodResolver(schema.wiki),
  });

  const [result, setResult] = useState('');

  async function onSubmit(payload: WikiSchema) {
    const { data } = await nextAxios.post('/api/wikis', payload);

    const hljsResult = hljs.highlightAuto(data.result).value;

    setResult(hljsResult);
  }

  const {
    formState: { isSubmitting },
  } = wikiForm;

  return (
    <Layout
      description={
        'Type your topic in the field below and wait for your wiki pages. Examples of wiki topics are "company policies and procedures", "environmental issues and sustainability", or "economics and business".'
      }
      title={'Liferay Wiki Content Generator'}
    >
      <Form
        formProviderProps={wikiForm}
        onSubmit={wikiForm.handleSubmit(onSubmit)}
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:gap-4 mb-5">
          <Input
            label="Wiki Topic"
            name="wikiTopic"
            placeholder="Enter a wiki topic"
          />

          <Input
            label="Wiki Node Name"
            name="wikiNodeName"
            placeholder="Enter a wiki node name"
          />

          <Input label="Site ID" name="siteId" placeholder="Enter a site ID" />

          <Input
            label="Expected Page Length (in # of words)"
            name="wikiArticleLength"
            placeholder="Enter a wiki article length"
          />

          <Input
            label="Number of Pages to Create"
            name="wikiPageNumber"
            placeholder="Number of of wiki sections"
          />

          <Input
            label="Number of Child Pages per Page"
            name="wikiChildPageNumber"
            placeholder="Number of of wiki child pages"
          />

          <Select
            label="View Options"
            name="viewOptions"
            optionMap={viewOptions}
          />
        </div>

        <FieldSubmit
          disabled={!wikiForm.formState.isValid || isSubmitting}
          label="Generate Wiki Node and Pages"
        />
      </Form>

      {isSubmitting ? (
        <LoadingAnimation />
      ) : (
        result && <ResultDisplay result={result} />
      )}
    </Layout>
  );
}
