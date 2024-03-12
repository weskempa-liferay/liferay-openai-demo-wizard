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

type MessageBoardSchema = z.infer<typeof schema.messageBoard>;

const languageOptions = functions.getAvailableLanguages();
const viewOptions = functions.getViewOptions();

export default function MessageBoard() {
  const messageBoardForm = useForm<MessageBoardSchema>({
    defaultValues: {
      mbLanguage: 'en-US',
      mbMessageNumber: '2',
      mbSectionNumber: '3',
      mbThreadLength: '50',
      mbThreadNumber: '3',
      viewOptions: viewOptions[0].id,
    },
    resolver: zodResolver(schema.messageBoard),
  });

  const [result, setResult] = useState('');

  async function onSubmit(payload: MessageBoardSchema) {
    const { data } = await nextAxios.post('/api/messageboard', payload);

    const hljsResult = hljs.highlightAuto(data.result).value;
    setResult(hljsResult);
  }

  const {
    formState: { isSubmitting },
  } = messageBoardForm;

  return (
    <Layout
      description='Type your topic in the field below and wait for your Message Board Threads. Examples of message board topics are "healthy living", "travel advice and tips", or "running a successful dog grooming business".'
      title="Liferay Message Board Content Generator"
    >
      <Form
        formProviderProps={messageBoardForm}
        onSubmit={messageBoardForm.handleSubmit(onSubmit)}
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:gap-4 mb-5">
          <Input
            label="Message Board Topic"
            name="mbTopic"
            placeholder="Enter a message board topic"
          />

          <Input label="Site ID" name="siteId" placeholder="Enter a site ID" />

          <Input
            label="Expected Thread Length (in # of words)"
            name="mbThreadLength"
            placeholder="Enter a message board thread length"
          />

          <Input
            label="Number of Sections to Create"
            name="mbSectionNumber"
            placeholder="Number of message board sections"
          />

          <Input
            label="Number of Threads to Create per Section"
            name="mbThreadNumber"
            placeholder="Message board threads per section"
          />

          <Input
            label="Number of Messages to Create per Thread"
            name="mbMessageNumber"
            placeholder="Message board messages per thread"
          />

          <Select
            label="Message Board Language"
            name="mbLanguage"
            optionMap={languageOptions}
          />

          <Select
            label="View Options"
            name="viewOptions"
            optionMap={viewOptions}
          />
        </div>

        <FieldSubmit
          disabled={isSubmitting}
          label={'Generate Message Board Threads'}
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
