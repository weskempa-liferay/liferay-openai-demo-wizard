import hljs from 'highlight.js';
import { useEffect, useMemo, useState } from 'react';
import React from 'react';
import { useForm } from 'react-hook-form';

import FieldSubmit from '../components/formfield-submit';
import Form from '../components/forms/form';
import Input from '../components/forms/input';
import Select from '../components/forms/select';
import ImageStyle from '../components/imagestyle';
import Layout from '../components/layout';
import LoadingAnimation from '../components/loadinganimation';
import ResultDisplay from '../components/resultdisplay';
import schema, { z, zodResolver } from '../schemas/zod';
import nextAxios from '../services/next';
import { USDollar } from '../utils/currency';

type ProductAISchema = z.infer<typeof schema.productsAI>;

export default function Products() {
  const productForm = useForm<ProductAISchema>({
    defaultValues: {
      imageGeneration: 'none',
      imageStyle: '',
      numberOfCategories: '5',
      numberOfProducts: '3',
    },
    resolver: zodResolver(schema.productsAI),
  });

  const [productCatalogOptions, setProductCatalogOptions] = useState([]);
  const [result, setResult] = useState('');

  const {
    formState: { isSubmitting },
    setValue,
    watch,
  } = productForm;

  const numberOfCategories = watch('numberOfCategories');
  const numberOfProducts = watch('numberOfProducts');
  const imageGeneration = watch('imageGeneration');

  const { showImageStyle, submitLabel } = useMemo(() => {
    let showImageStyle = false;
    let cost = '';

    if (
      isNaN(parseInt(numberOfCategories)) &&
      isNaN(parseInt(numberOfProducts))
    ) {
      cost = '$0.00';
    } else if (imageGeneration == 'dall-e-3') {
      showImageStyle = true;
      cost = USDollar.format(
        parseInt(numberOfCategories) * parseInt(numberOfProducts) * 0.04
      );
    } else if (imageGeneration == 'dall-e-2') {
      cost = USDollar.format(
        parseInt(numberOfCategories) * parseInt(numberOfProducts) * 0.02
      );
    } else {
      cost = '<$0.01';
    }

    return {
      showImageStyle,
      submitLabel: 'Generate Products - Estimated cost: ' + cost,
    };
  }, [imageGeneration, numberOfCategories, numberOfProducts]);

  async function onSubmit(payload: ProductAISchema) {

    console.log(payload);

    const { data } = await nextAxios.post('/api/products-ai', payload);

    const hljsResult = hljs.highlightAuto(data.result).value;
    setResult(hljsResult);
  }

  return (
    <Layout
      description='This is an Open AI integration to generate demo products. Examples of the commerce theme are "home energy saving products", "electric vehicles", or "bird feeders and supplies"'
      title="Liferay Product Generator"
    >
      <Form
        formProviderProps={productForm}
        onSubmit={productForm.handleSubmit(onSubmit)}
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 mb-5">
          <Input
            label="Commerce Theme"
            name="companyTheme"
            placeholder="Enter a commerce theme"
          />

          <Input
            label="Vocabulary Name"
            name="vocabularyName"
            placeholder="Enter a vocabulary name"
          />

          <Input
            label="Global Site ID for Taxonomy"
            name="globalSiteId"
            placeholder="Enter the global site ID"
          />

          <Input
            label="Number of Categories"
            name="numberOfCategories"
            placeholder="Enter the number of categories"
          />

          <Input
            label="Number of Products per Category"
            name="numberOfProducts"
            placeholder="Enter the number of products per category"
          />

          <Input
            label="Product Catalog ID"
            name="catalogId"
            optioplaceholdernMap="Enter the Catalog ID"
          />

          <Select
            label="Image Generation"
            name="imageGeneration"
            optionMap={[
              { id: 'none', name: 'None' },
              { id: 'dall-e-3', name: 'DALL·E 3 (Highest-Quality Images)' },
              { id: 'dall-e-2', name: 'DALL·E 2 (Basic Images)' },
            ]}
          />

          {showImageStyle && (
            <ImageStyle
              styleInputChange={(newValue: string) =>
                setValue('imageStyle', newValue)
              }
            />
          )}
        </div>

        <FieldSubmit disabled={isSubmitting} label={submitLabel} />
      </Form>

      {isSubmitting ? (
        <LoadingAnimation />
      ) : (
        result && <ResultDisplay result={result} />
      )}
    </Layout>
  );
}
