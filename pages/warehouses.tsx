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

type WarehouseSchema = z.infer<typeof schema.warehouse>;

export default function Warehouses() {
  const warehouseForm = useForm<WarehouseSchema>({
    defaultValues: {
      warehouseNumber: '10',
      warehouseRegion: 'Europe',
    },
    resolver: zodResolver(schema.warehouse),
  });

  const [result, setResult] = useState('');

  async function onSubmit(payload: WarehouseSchema) {
    const { data } = await nextAxios.post('/api/warehouses', payload);

    const hljsResult = hljs.highlightAuto(data.result).value;

    setResult(hljsResult);
  }

  const {
    formState: { isSubmitting },
  } = warehouseForm;

  return (
    <Layout
      description="Type your region into the field below and wait for your warehouses. <br/> Example regions  are 'global', 'Midwestern United States', 'Italy and surrounding countries'."
      title="Liferay Warehouse Generator"
    >
      <Form
        formProviderProps={warehouseForm}
        onSubmit={warehouseForm.handleSubmit(onSubmit)}
      >
        <div className="w-700 grid grid-cols-2 gap-2 sm:grid-cols-2 md:gap-4 mb-5">
          <Input
            label="Region for Warehouses"
            name="warehouseRegion"
            placeholder="Enter a region for your warehouses"
          />

          <Input
            label="Number of Warehouses"
            name="warehouseNumber"
            placeholder="Enter a the number of warehouses to generate"
          />
        </div>

        <FieldSubmit disabled={isSubmitting} label="Generate Warehouses" />
      </Form>

      <p className="text-slate-100 text-center text-lg mb-3 rounded p-5 bg-white/10 w-1/2 italic">
        <b>Note:</b> Recently the AI generation of warehouse lists became not
        dependable for GPT 3.5. Because of this, GPT 4.0 Turbo Preview is
        automatically enforced.
      </p>

      {isSubmitting ? (
        <LoadingAnimation />
      ) : (
        result && <ResultDisplay result={result} />
      )}
    </Layout>
  );
}
