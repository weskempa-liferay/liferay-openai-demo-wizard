import { zodResolver } from '@hookform/resolvers/zod';
import hljs from 'highlight.js';
import { useState } from 'react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import FieldSubmit from '../components/formfield-submit';
import Form from '../components/forms/form';
import Input from '../components/forms/input';
import Layout from '../components/layout';
import LoadingAnimation from '../components/loadinganimation';
import ResultDisplay from '../components/resultdisplay';
import nextAxios from '../services/next';
import { logger } from '../utils/logger';

const accountFormSchema = z.object({
  businessDescription: z.string().min(3),
  numberOfAccounts: z.string().min(1),
});

type AccountFormSchema = z.infer<typeof accountFormSchema>;

export default function Accounts() {
  const [result, setResult] = useState('');

  const accountForm = useForm<AccountFormSchema>({
    defaultValues: {
      businessDescription: '',
      numberOfAccounts: '1',
    },
    resolver: zodResolver(accountFormSchema),
  });

  const {
    formState: { isSubmitting },
  } = accountForm;

  async function onSubmit({
    businessDescription,
    numberOfAccounts,
  }: AccountFormSchema) {
    const { data } = await nextAxios.post('/api/accounts', {
      accountNumber: numberOfAccounts,
      accountTopic: businessDescription,
    });

    const hljsResult = hljs.highlightAuto(data.result).value;

    setResult(hljsResult);
  }

  return (
    <Layout
      description={`Type your business description in the field below and wait for your Accounts. Examples of business descriptions are "automotive supplies", "medical equipment", or "government services".`}
      title="Liferay Account Generator"
    >
      <Form
        formProviderProps={accountForm}
        onSubmit={accountForm.handleSubmit(onSubmit)}
      >
        <div className="w-700 grid grid-cols-2 gap-2 sm:grid-cols-2 md:gap-4 mb-5">
          <Input
            label="Business Description"
            name="businessDescription"
            placeholder="Enter a Business Description"
          />

          <Input
            label="Number of Accounts"
            name="numberOfAccounts"
            placeholder="Enter a the number of accounts to generate"
          />
        </div>

        <FieldSubmit disabled={isSubmitting} label="Generate Accounts" />
      </Form>

      {isSubmitting ? (
        <LoadingAnimation />
      ) : (
        result && <ResultDisplay result={result} />
      )}
    </Layout>
  );
}
