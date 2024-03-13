import { XCircleIcon } from '@heroicons/react/24/solid';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { z } from 'zod';

import functions from '../utils/functions';
import Form from './forms/form';
import Input from './forms/input';
import Select from './forms/select';
import FieldSelect from '../components/formfield-select';

const configFormSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  login: z.string(),
  model: z.string(),
  openAIKey: z.string(),
  password: z.string(),
  serverURL: z.string(),
});

const authenticationTypes = [
  { id: 'basic', name: 'Basic Authentiction' },
  { id: 'oauth', name: 'OAuth2' }
]

const aiModelOptions = functions.getAIModelOptions();

export default function ConfigModal({
  appConfig,
  saveConfiguration,
  setShowModal,
}) {
  const configForm = useForm<z.infer<typeof configFormSchema>>({
    defaultValues: appConfig,
    resolver: zodResolver(configFormSchema),
  });

  const [authMethod, setAuthMethod] = useState("basic");

  return (
    <Form
      formProviderProps={configForm}
      onSubmit={configForm.handleSubmit(saveConfiguration)}
    >
      <div className="popup text-black justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
        <div className="relative w-auto my-6 mx-auto max-w-3xl">
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
              <h3 className="text-3xl font-semibold mr-6">
                AI Content Wizard Configuration
              </h3>
              <XCircleIcon
                className="h-8 w-8 fill-blue-500 cursor-pointer"
                onClick={() => setShowModal(false)}
              />
            </div>

            <div className="relative p-4 flex-auto">
              <div className="mb-2">
                <div className="mb-2 p-2 bg-blue-500/20 rounded-lg font-normal">
                  <div className="mb-1">
                    <Input
                      label="OpenAI Key"
                      name="openAIKey"
                      placeholder="Enter an openai key"
                    />

                    <Select
                      label="AI Model"
                      name="model"
                      optionMap={aiModelOptions}
                    />

                    <p className="text-xs text-black/60 pt-2 mt-2 p-2 bg-sky-400/20 rounded-lg font-normal">
                      OpenAI{' '}
                      <a
                        className="text-sky-500"
                        href="https://platform.openai.com/docs/models/overview"
                        target="_new"
                      >
                        Models
                      </a>{' '}
                      and{' '}
                      <a
                        className="text-sky-500"
                        href="https://openai.com/pricing"
                        target="_new"
                      >
                        Pricing
                      </a>
                    </p>
                  </div>
                </div>

                <div className="p-2 mb-2 bg-green-600/20 rounded-lg">
                  <Input
                    label="Set Server URL"
                    name="serverURL"
                    placeholder="Enter server url"
                  />
                </div>

                <div className="mb-2 p-2 bg-blue-600/20 rounded-lg">

                  <FieldSelect
                    inputChange={setAuthMethod}
                    label="Select Authentication Type"
                    name="authenticationType"
                    optionMap={authenticationTypes}
                  />

                </div>

              {authMethod == 'basic' ? (

                <div className="mb-2 p-2 bg-blue-600/30 rounded-lg">
                  <Input
                    label="User Login"
                    name="login"
                    placeholder="Enter user login"
                  />

                  <Input
                    label="Password"
                    name="password"
                    placeholder="Enter password (Password is never saved directly)"
                    type="password"
                  />

                </div>
            
              ) : (

                <div className="mb-2 p-2 bg-blue-600/30 rounded-lg">

                  <Input
                    label="OAuth2 - Client ID"
                    name="clientId"
                    placeholder="Enter Client ID (Secrets are never saved directly)"
                  />

                  <Input
                    label="OAuth2 - Client Secret"
                    name="clientSecret"
                    placeholder="Enter Client Secret (Secrets are never saved directly)"
                  />
                </div>

              )}

              </div>
            </div>

            <div className="flex items-center justify-center p-2 border-t border-solid border-blueGray-200 rounded-b">
              <button
                className="bg-blue-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="submit"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </Form>
  );
}
