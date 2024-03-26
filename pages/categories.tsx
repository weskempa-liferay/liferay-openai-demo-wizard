import hljs from 'highlight.js';
import { useState } from 'react';
import React from 'react';
import { useForm } from 'react-hook-form';

import FieldLanguage from '../components/formfield-language';
import FieldSubmit from '../components/formfield-submit';
import Form from '../components/forms/form';
import Input from '../components/forms/input';
import Layout from '../components/layout';
import LoadingAnimation from '../components/loadinganimation';
import ResultDisplay from '../components/resultdisplay';
import schema, { z, zodResolver } from '../schemas/zod';
import nextAxios from '../services/next';

type CategorySchema = z.infer<typeof schema.category>;

export default function Categories() {
  const [result, setResult] = useState('');

  const categoriesForm = useForm<CategorySchema>({
    defaultValues: {
      categorytNumber: '5',
      childCategorytNumber: '3',
      defaultLanguage: 'en-US',
      languages: [],
      manageLanguage: false,
      vocabularyDescription: 'Various categories of books',
      vocabularyName: 'Books types',
    },
    resolver: zodResolver(schema.category),
  });

  async function onSubmit(payload: CategorySchema) {
    const { data } = await nextAxios.post('/api/categories', payload);

    const hljsResult = hljs.highlightAuto(data.result).value;

    setResult(hljsResult);
  }

  const {
    formState: { isSubmitting },
  } = categoriesForm;

  return (
    <Layout
      description={`Type your business description in the field below and wait for your categories. Examples of vocabulary themes are "various categories of books", "types of healthcare services", or "options for home furniture".`}
      title="Liferay Category Generator"
    >
      <Form
        formProviderProps={categoriesForm}
        onSubmit={categoriesForm.handleSubmit(onSubmit)}
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:gap-4 mb-5">
          <Input
            label="Vocabulary Theme"
            name="vocabularyDescription"
            placeholder="Enter a vocabulary description"
          />

          <Input
            label="Vocabulary Name"
            name="vocabularyName"
            placeholder="Enter a vocabulary name"
          />

          <Input
            label="Site ID or Asset Library Group ID"
            name="siteId"
            placeholder="Enter a site ID or asset library group ID"
          />

          <Input
            label="Number of Categories"
            name="categorytNumber"
            placeholder="Enter a the number of categories to generate"
          />

          <Input
            label="Number of Child Categories"
            name="childCategorytNumber"
            placeholder="Enter a the number of child categories to generate"
          />
        </div>

        <FieldLanguage
          defaultLanguageChange={(value) =>
            categoriesForm.setValue('defaultLanguage', value)
          }
          languagesChange={(value) =>
            categoriesForm.setValue('languages', value)
          }
          manageLanguageChange={(value) =>
            categoriesForm.setValue('manageLanguage', value)
          }
        />

        <FieldSubmit 
          disabled={!categoriesForm.formState.isValid || isSubmitting}
          label="Generate Categories" />
      </Form>

      {isSubmitting ? (
        <LoadingAnimation />
      ) : (
        result && <ResultDisplay result={result} />
      )}
    </Layout>
  );
}
