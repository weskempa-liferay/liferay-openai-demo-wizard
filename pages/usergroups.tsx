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

type UserGroupsSchema = z.infer<typeof schema.userGroups>;

export default function UserGroups() {
  const userGroupsForm = useForm<UserGroupsSchema>({
    defaultValues: {
      userGroupNumber: '10',
      userGroupTopic: 'Job Placement Services and Training',
    },
    resolver: zodResolver(schema.userGroups),
  });

  const [result, setResult] = useState('');

  async function onSubmit(payload: UserGroupsSchema) {
    const { data } = await nextAxios.post('/api/usergroups', payload);

    const hljsResult = hljs.highlightAuto(data.result).value;

    setResult(hljsResult);
  }

  const {
    formState: { isSubmitting },
  } = userGroupsForm;

  return (
    <Layout
      description='Type your business description in the field below and wait for your user groups to be generated. Examples of business descriptions are "higher education", "automotive manufacturing and engineering", or "healthcare specialists and patients".'
      title="Liferay User Group Generator"
    >
      <Form
        formProviderProps={userGroupsForm}
        onSubmit={userGroupsForm.handleSubmit(onSubmit)}
      >
        <div className="w-700 grid grid-cols-2 gap-2 sm:grid-cols-2 md:gap-4 mb-5">
          <Input
            label="Business Description"
            name="userGroupTopic"
            placeholder="Enter a business description"
          />

          <Input
            label="Number of User Groups"
            name="userGroupNumber"
            placeholder="Enter a the number of user groups to generate"
          />
        </div>

        <FieldSubmit 
          disabled={!userGroupsForm.formState.isValid || isSubmitting}
          label="Generate User Group" />
      </Form>

      {isSubmitting ? (
        <LoadingAnimation />
      ) : (
        result && <ResultDisplay result={result} />
      )}
    </Layout>
  );
}
