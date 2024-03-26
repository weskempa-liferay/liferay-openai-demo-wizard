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

type KnowledgeBaseSchema = z.infer<typeof schema.knowledgeBase>;

const languageOptions = functions.getAvailableLanguages();
const viewOptions = functions.getViewOptions();

export default function KnowledgeBase() {
  const knowledgeBaseForm = useForm<KnowledgeBaseSchema>({
    defaultValues: {
      kbArticleLength: '100',
      kbArticleNumber: '4',
      kbFolderNumber: '3',
      kbLanguage: 'en-US',
      kbTopic: '',
      siteId: '',
      viewOptions: viewOptions[0].id,
    },
    resolver: zodResolver(schema.knowledgeBase),
  });
  const [result, setResult] = useState('');

  async function onSubmit(payload: KnowledgeBaseSchema) {
    const { data } = await nextAxios.post('/api/knowledgebase', payload);

    const hljsResult = hljs.highlightAuto(data.result).value;

    setResult(hljsResult);
  }

  const {
    formState: { isSubmitting },
  } = knowledgeBaseForm;

  return (
    <Layout
      description='Type your topic in the field below and wait for your Knowledge Base Threads. Examples of knowledge base topics are "dangerous material handling", "healthy living tips", or "creating a positive work environment".'
      title="Liferay Knowledge Base Content Generator"
    >
      <Form
        formProviderProps={knowledgeBaseForm}
        onSubmit={knowledgeBaseForm.handleSubmit(onSubmit)}
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:gap-4 mb-5">
          <Input
            label="Knowledge Base Topic"
            name="kbTopic"
            placeholder="Enter a knowledge base topic"
          />

          <Input label="Site ID" name="siteId" placeholder="Enter a site ID" />

          <Input
            label="Expected Article Length (in # of words)"
            name="kbArticleLength"
            placeholder="Enter a knowledge base article length"
          />

          <Input
            label="Number of Folders to Create"
            name="kbFolderNumber"
            placeholder="Number of of knowledge base sections"
          />

          <Input
            label="Number of Articles to Create per Section"
            name="kbArticleNumber"
            placeholder="Number of of knowledge base sections"
          />

          <Select
            label="Knowledge Base Language"
            name="kbLanguage"
            optionMap={languageOptions}
          />

          <Select
            label="View Options"
            name="viewOptions"
            optionMap={viewOptions}
          />
        </div>

        <FieldSubmit 
          disabled={!knowledgeBaseForm.formState.isValid || isSubmitting}
          label="Generate Knowledge Base Articles"
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
