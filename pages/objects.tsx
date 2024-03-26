import hljs from 'highlight.js';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

import FieldSubmit from '../components/formfield-submit';
import Form from '../components/forms/form';
import Input from '../components/forms/input';
import Select from '../components/forms/select';
import Layout from '../components/layout';
import LoadingAnimation from '../components/loadinganimation';
import ResultDisplay from '../components/resultdisplay';
import schema, { z, zodResolver } from '../schemas/zod';
import nextAxios from '../services/next';

type ObjectsSchema = z.infer<typeof schema.objects>;

export default function Objects() {
  const objectsForm = useForm<ObjectsSchema>({
    defaultValues: {
      aiEndpoint: '/o/c/exampleobjects/batch',
      aiRequest: 'Provide a list of 10 countries in Europe',
      aiRole:
        'You are a helpful assistant responsible for providing a list of answers',
      objectFields: [
        { fieldDescription: '', fieldName: '', fieldType: 'string' },
      ],
    },
    resolver: zodResolver(schema.objects),
  });

  const { fields, ...fieldArray } = useFieldArray({
    control: objectsForm.control,
    name: 'objectFields',
  });

  const [updateCount, setUpdateCount] = useState(0);
  const [result, setResult] = useState('');

  const objectFields = objectsForm.watch('objectFields');

  const onSubmit = async (payload: ObjectsSchema) => {
    let postFields = {};

    for (let i = 0; i < objectFields.length; i++) {
      let fieldName = objectFields[i].fieldName;
      postFields[fieldName] = {
        description: objectFields[i].fieldDescription,
        type: objectFields[i].fieldType,
      };
    }

    const { data } = await nextAxios.post('/api/objects', {
      ...payload,
      objectFields: postFields,
    });

    const hljsResult = hljs.highlightAuto(data.result).value;

    setResult(hljsResult);
  };

  const addField = () => {
    fieldArray.append({ fieldDescription: '', fieldName: '', fieldType: '' });

    setUpdateCount(updateCount + 1);
  };

  const removeField = (index: number) => {
    fieldArray.remove(index);

    setUpdateCount(updateCount + 1);
  };

  const {
    formState: { isSubmitting },
  } = objectsForm;

  return (
    <Layout
      description="Complete the prompts below and describe your object to create the object data."
      title="Liferay Object Data Generator"
    >
      <Form
        className="mb-6"
        formProviderProps={objectsForm}
        onSubmit={objectsForm.handleSubmit(onSubmit)}
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-1 mb-5">
          <Input
            label="The role the AI generator should act as"
            name="aiRole"
            placeholder="Enter the AI role here"
          />

          <Input
            label="Specific request to OpenAI"
            name="aiRequest"
            placeholder="Enter your specific request to OpenAI"
          />

          <Input
            label="Location of your object's batch endpoint (Example /o/c/exampleobjects/batch)"
            name="aiEndpoint"
            placeholder="Enter an object's batch endpoint"
          />
        </div>

        <div className="bg-white/10 rounded p-3 mb-5">
          <h4 className="text-slate-200 font-bold mb-3">
            Describe your object structure
          </h4>

          {fields.map((_, index) => (
            <div
              className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:gap-4 mb-4"
              key={index}
            >
              <Input
                label="Object Field Key Name"
                name={`objectFields.${index}.fieldName`}
                placeholder="Enter a object field name"
              />

              <Input
                label="Content Description"
                name={`objectFields.${index}.fieldDescription`}
                placeholder="Example: Country Name"
              />

              <Select
                label="Field Type"
                name={`objectFields.${index}.fieldType`}
                optionMap={[{ id: 'string', name: 'String' }]}
              />
            </div>
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
              onClick={() => removeField(objectFields.length - 1)}
            >
              Remove Last Field
            </button>
          </div>
        </div>

        <FieldSubmit 
          disabled={!objectsForm.formState.isValid || isSubmitting}
          label="Generate Object Data" />
      </Form>

      {isSubmitting ? (
        <LoadingAnimation />
      ) : (
        result && <ResultDisplay result={result} />
      )}

      <div className="hidden">{updateCount}</div>
    </Layout>
  );
}
