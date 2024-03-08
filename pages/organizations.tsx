import hljs from 'highlight.js';
import { useState } from 'react';
import React from 'react';

import FieldString from '../components/formfield-string';
import FieldSubmit from '../components/formfield-submit';
import Layout from '../components/layout';
import LoadingAnimation from '../components/loadinganimation';
import ResultDisplay from '../components/resultdisplay';
import functions from '../utils/functions';

export default function Organizations() {
  const [organizationTopicInput, setOrganizationTopicInput] = useState(
    'National Internet, Phone, and Cable'
  );
  const [childOrganizationtNumberInput, setChildOrganizationtNumberInput] =
    useState('3');
  const [departmentNumberInput, setDepartmentNumberInput] = useState('3');

  const [result, setResult] = useState(() => '');
  const [isLoading, setIsLoading] = useState(false);

  const [appConfig, setAppConfig] = useState({
    model: functions.getDefaultAIModel(),
  });

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    const response = await fetch('/api/organizations', {
      body: JSON.stringify({
        childOrganizationtNumber: childOrganizationtNumberInput,
        config: appConfig,
        departmentNumber: departmentNumberInput,
        organizationTopic: organizationTopicInput,
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
      description='Type your business description in the field below and wait for your organization. Examples of business descriptions are "automotive supplies", "medical equipment", or "government services".'
      setAppConfig={setAppConfig}
      title="Liferay Organization Generator"
    >
      <form onSubmit={onSubmit}>
        <div className="w-700 grid grid-cols-2 gap-2 sm:grid-cols-2 md:gap-4 mb-5">
          <FieldString
            defaultValue="National Internet, Phone, and Cable"
            inputChange={setOrganizationTopicInput}
            label="Business Description"
            name="businessDescription"
            placeholder="Enter a business description"
          />

          <FieldString
            defaultValue="3"
            inputChange={setChildOrganizationtNumberInput}
            label="Number of Child Organizations"
            name="numberOfChildOrganizations"
            placeholder="Enter a the number of child organizations to generate"
          />

          <FieldString
            defaultValue="3"
            inputChange={setDepartmentNumberInput}
            label="Number of Departments"
            name="numberOfDepartments"
            placeholder="Enter a the number of departments to generate"
          />
        </div>

        <FieldSubmit disabled={isLoading} label="Generate Organization" />
      </form>

      {isLoading ? (
        <LoadingAnimation />
      ) : (
        result && <ResultDisplay result={result} />
      )}
    </Layout>
  );
}
