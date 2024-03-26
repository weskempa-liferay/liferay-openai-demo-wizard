import hljs from 'highlight.js';
import { useState } from 'react';
import React from 'react';
import { useForm } from 'react-hook-form';

import FieldSubmit from '../components/formfield-submit';
import FieldToggle from '../components/formfield-toggle';
import Form from '../components/forms/form';
import Input from '../components/forms/input';
import Layout from '../components/layout';
import LoadingAnimation from '../components/loadinganimation';
import ResultDisplay from '../components/resultdisplay';
import schema, { z, zodResolver } from '../schemas/zod';
import nextAxios from '../services/next';

type PagesAISchema = z.infer<typeof schema.pagesAI>;

export default function PagesAI() {
  const pagesAIForm = useForm<PagesAISchema>({
    defaultValues: {
      addPageContent: true,
      childPageNumber: '3',
      pageNumber: '8',
      pageTopic: 'Company Intranet Portal',
    },
    resolver: zodResolver(schema.pagesAI),
  });

  const [result, setResult] = useState('');

  async function onSubmit(payload: PagesAISchema) {
    const { data } = await nextAxios.post('/api/pages-ai', payload);

    const hljsResult = hljs.highlightAuto(data.result).value;
    setResult(hljsResult);
  }

  const {
    formState: { isSubmitting },
    setValue,
    watch,
  } = pagesAIForm;

  const addPageContent = watch('addPageContent');

  return (
    <Layout
      description='Type your business description in the field below and wait for your pages. Examples of site descriptions are "automotive supplier portal", "college student portal", or "botanical hobbyist site".'
      title="Liferay Page Generator"
    >
      <Form
        formProviderProps={pagesAIForm}
        onSubmit={pagesAIForm.handleSubmit(onSubmit)}
      >
        <div className="w-700 grid grid-cols-2 gap-2 sm:grid-cols-2 md:gap-4 mb-5">
          <Input
            label="Site Description"
            name="pageTopic"
            placeholder="Enter a site description"
          />

          <Input
            label="Site ID"
            name="siteId"
            placeholder="Enter id of the site that you would like to add pages to"
          />

          <Input
            label="Maximum Number of Pages"
            name="pageNumber"
            placeholder="Enter a the max number of top level pages to generate"
          />

          <Input
            label="Maximum Number of Child Pages"
            name="childPageNumber"
            placeholder="Enter a the max number of child pages to generate"
          />

          <FieldToggle
            defaultValue={true}
            fieldKey="addContent"
            inputChange={() => setValue('addPageContent', !addPageContent)}
            name="Generate Page Content (EARLY RELEASE, increases content generation time)"
          />
        </div>

        <FieldSubmit 
          disabled={!pagesAIForm.formState.isValid || isSubmitting}
          label="Generate Pages" />
      </Form>

      <p className="text-slate-100 text-center text-lg mb-3 rounded p-5 bg-white/10 w-1/2 italic">
        <b>Note:</b> The AI generation of page lists was not dependable for GPT
        3.5. Because of this, GPT 4.0 is automatically enforced for generating a
        complete page structure. Subsequent calls will use the selected model.
      </p>

      {isSubmitting ? (
        <LoadingAnimation />
      ) : (
        result && <ResultDisplay result={result} />
      )}
    </Layout>
  );
}
