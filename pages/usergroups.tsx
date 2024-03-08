import hljs from 'highlight.js';
import { useState } from 'react';
import React from 'react';

import FieldString from '../components/formfield-string';
import FieldSubmit from '../components/formfield-submit';
import Layout from '../components/layout';
import LoadingAnimation from '../components/loadinganimation';
import ResultDisplay from '../components/resultdisplay';
import functions from '../utils/functions';

export default function Review() {
  const [userGroupTopicInput, setOrganizationTopicInput] = useState(
    'Job Placement Services and Training'
  );
  const [userGroupNumberInput, setUserGroupNumberInput] = useState('10');

  const [result, setResult] = useState(() => '');
  const [isLoading, setIsLoading] = useState(false);

  const [appConfig, setAppConfig] = useState({
    model: functions.getDefaultAIModel(),
  });

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    const response = await fetch('/api/usergroups', {
      body: JSON.stringify({
        config: appConfig,
        userGroupNumber: userGroupNumberInput,
        userGroupTopic: userGroupTopicInput,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
    const data = await response.json();
    console.log('data', data);

    const hljsResult = hljs.highlightAuto(data.result).value;
    setResult(hljsResult);

    setIsLoading(false);
  }

  return (
    <Layout
      description='Type your business description in the field below and wait for your user groups to be generated. Examples of business descriptions are "higher education", "automotive manufacturing and engineering", or "healthcare specialists and patients".'
      setAppConfig={setAppConfig}
      title="Liferay User Group Generator"
    >
      <form onSubmit={onSubmit}>
        <div className="w-700 grid grid-cols-2 gap-2 sm:grid-cols-2 md:gap-4 mb-5">
          <FieldString
            defaultValue="Job Placement Services and Training"
            inputChange={setOrganizationTopicInput}
            label="Business Description"
            name="companyTopic"
            placeholder="Enter a business description"
          />

          <FieldString
            defaultValue="10"
            inputChange={setUserGroupNumberInput}
            label="Number of User Groups"
            name="numberOfUserGroups"
            placeholder="Enter a the number of user groups to generate"
          />
        </div>

        <FieldSubmit disabled={isLoading} label="Generate User Group" />
      </form>

      {isLoading ? (
        <LoadingAnimation />
      ) : (
        result && <ResultDisplay result={result} />
      )}
    </Layout>
  );
}
