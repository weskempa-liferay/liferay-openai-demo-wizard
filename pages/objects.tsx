import hljs from 'highlight.js';
import { useState } from 'react';

import FieldString from '../components/formfield-string';
import FieldSubmit from '../components/formfield-submit';
import Layout from '../components/layout';
import LoadingAnimation from '../components/loadinganimation';
import ObjectField from '../components/objectfield';
import ResultDisplay from '../components/resultdisplay';
import functions from '../utils/functions';

export default function Objects() {
  const [aiRoleInput, setAiRoleInput] = useState(
    'You are a helpful assistant responsible for providing a list of answers'
  );
  const [aiRequestInput, setAiRequestInput] = useState(
    'Provide a list of 10 countries in Europe'
  );
  const [aiEndpointInput, setAiEndpointInput] = useState(
    '/o/c/exampleobjects/batch'
  );
  const [objectFields, setObjectFields] = useState([
    { fieldDescription: '', fieldName: '', fieldType: '' },
  ]);
  const [updateCount, setUpdateCount] = useState(0);

  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [appConfig, setAppConfig] = useState({
    model: functions.getDefaultAIModel(),
  });

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    let postFields = {};

    for (let i = 0; i < objectFields.length; i++) {
      let fieldName = objectFields[i].fieldName;
      postFields[fieldName] = {
        description: objectFields[i].fieldDescription,
        type: objectFields[i].fieldType,
      };
    }

    const response = await fetch('/api/objects', {
      body: JSON.stringify({
        aiEndpoint: aiEndpointInput,
        aiRequest: aiRequestInput,
        aiRole: aiRoleInput,
        config: appConfig,
        objectFields: postFields,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
    const data = await response.json();

    const hljsResult = hljs.highlightAuto(data.result).value;

    setResult(hljsResult), setIsLoading(isLoading);
  };

  const addField = (event) => {
    event.preventDefault();

    let stack = objectFields;
    stack.push({ fieldDescription: '', fieldName: '', fieldType: '' });

    setObjectFields(stack);
    setUpdateCount(updateCount + 1);
  };

  const removeField = (event) => {
    event.preventDefault();
    if (objectFields.length > 1) {
      let stack = objectFields.splice(0, objectFields.length - 1);

      setObjectFields(stack);
      setUpdateCount(updateCount + 1);
    }
  };

  const handleFieldChange = (event, key) => {
    setObjectFields(updateStack(event, key));
  };

  const updateStack = (fieldSet, id) => {
    let fields = objectFields;

    fields.splice(id, 1, fieldSet);
    return fields;
  };

  return (
    <Layout
      description="Complete the prompts below and describe your object to create the object data."
      setAppConfig={setAppConfig}
      title="Liferay Object Data Generator"
    >
      <form className="mb-6" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-1 mb-5">
          <FieldString
            defaultValue="You are a helpful assistant responsible for providing a list of answers"
            inputChange={setAiRoleInput}
            label="The role the AI generator should act as"
            name="role"
            placeholder="Enter the AI role here"
          />

          <FieldString
            defaultValue="Provide a list of 10 countries in Europe"
            inputChange={setAiRequestInput}
            label="Specific request to OpenAI"
            name="openAIRequest"
            placeholder="Enter your specific request to OpenAI"
          />

          <FieldString
            defaultValue="/o/c/exampleobjects/batch"
            inputChange={setAiEndpointInput}
            label={
              "Location of your object's batch endpoint (Example /o/c/exampleobjects/batch)"
            }
            name="endpoint"
            placeholder="Enter an object's batch endpoint"
          />
        </div>

        <div className="bg-white/10 rounded p-3 mb-5">
          <h4 className="text-slate-200 font-bold mb-3">
            Describe your object structure
          </h4>

          {Object.entries(objectFields).map((_, index) => (
            <ObjectField
              handleChange={handleFieldChange}
              id={index}
              key={index}
            />
          ))}

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:gap-4 mb-2">
            <button
              className="text-sm pl-4 pr-4 rounded mt-6 disabled:bg-blue-800 bg-blue-400 font-semibold h-7 text-white disabled:text-slate-400"
              onClick={addField}
            >
              Add Field
            </button>
            <button
              className="text-sm pl-4 pr-4 rounded mt-6 disabled:bg-blue-800 bg-blue-400 font-semiboldh-7 text-white disabled:text-slate-400"
              disabled={objectFields.length <= 1}
              onClick={removeField}
            >
              Remove Last Field
            </button>
          </div>
        </div>

        <FieldSubmit disabled={isLoading} label="Generate Object Data" />
      </form>

      {isLoading ? (
        <LoadingAnimation />
      ) : (
        result && <ResultDisplay result={result} />
      )}

      <div className="hidden">{updateCount}</div>
    </Layout>
  );
}
