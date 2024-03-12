import hljs from 'highlight.js';
import { useState } from 'react';
import React from 'react';
import { useForm } from 'react-hook-form';

import FieldSubmit from '../components/formfield-submit';
import Form from '../components/forms/form';
import Input from '../components/forms/input';
import Layout from '../components/layout';
import LoadingAnimation from '../components/loadinganimation';
import ResultDisplay from '../components/resultdisplay';
import schema, { z, zodResolver } from '../schemas/zod';
import nextAxios from '../services/next';

type OrganizationSchema = z.infer<typeof schema.organizations>;

export default function Organizations() {
  const organizationsForm = useForm<OrganizationSchema>({
    defaultValues: {
      childOrganizationtNumber: '3',
      departmentNumber: '3',
      organizationTopic: 'National Internet, Phone, and Cable',
    },
    resolver: zodResolver(schema.organizations),
  });

  const [result, setResult] = useState('');

  async function onSubmit(payload: OrganizationSchema) {
    const { data } = await nextAxios.post('/api/organizations', payload);

    const hljsResult = hljs.highlightAuto(data.result).value;

    setResult(hljsResult);
  }

  const {
    formState: { isSubmitting },
  } = organizationsForm;

  return (
    <Layout
      description='Type your business description in the field below and wait for your organization. Examples of business descriptions are "automotive supplies", "medical equipment", or "government services".'
      title="Liferay Organization Generator"
    >
      <Form
        formProviderProps={organizationsForm}
        onSubmit={organizationsForm.handleSubmit(onSubmit)}
      >
        <div className="w-700 grid grid-cols-2 gap-2 sm:grid-cols-2 md:gap-4 mb-5">
          <Input
            label="Business Description"
            name="organizationTopic"
            placeholder="Enter a business description"
          />

          <Input
            label="Number of Child Organizations"
            name="childOrganizationtNumber"
            placeholder="Enter a the number of child organizations to generate"
          />

          <Input
            label="Number of Departments"
            name="departmentNumber"
            placeholder="Enter a the number of departments to generate"
          />
        </div>

        <FieldSubmit disabled={isSubmitting} label="Generate Organization" />
      </Form>

      {isSubmitting ? (
        <LoadingAnimation />
      ) : (
        result && <ResultDisplay result={result} />
      )}
    </Layout>
  );
}
