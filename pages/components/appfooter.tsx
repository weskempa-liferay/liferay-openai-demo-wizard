import { BoltIcon, ExclamationTriangleIcon, Cog8ToothIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';

import functions from '../utils/functions';
import FieldConfigSelect from '../components/formfield-config-select';

import Cookies from 'universal-cookie';
const cookies = new Cookies();

export default function AppFooter({setConfig}) {
  const [envMsg, setEnvMsg] = useState('&nbsp;');
  const [envStatus, setEnvStatus] = useState('connected');

  const [showModal, setShowModal] = useState(false);
  const [aiModelSelect, setAIModelSelect] = useState(functions.getDefaultAIModel());
  const [appConfig, setAppConfig] = useState({
    model:functions.getDefaultAIModel()
  });

  const aiModelOptions = functions.getAIModelOptions();
  const APP_CONFIG_AI = "ai-wizard-config";

  const setEnv = (response) => {
    setEnvMsg(response.result);
    setEnvStatus(response.status);
  };

  const saveConfiguration = () => {
    setAppConfig({model:aiModelSelect});
    setConfig({model:aiModelSelect});

    cookies.set(APP_CONFIG_AI, aiModelSelect, { path: '/' });

    setShowModal(false);
  };

  useEffect(() => {
    if(!cookies.get(APP_CONFIG_AI)){
      cookies.set(APP_CONFIG_AI, aiModelSelect, { path: '/' });
    } else {
      let appConfig = {
        model:cookies.get(APP_CONFIG_AI)
      };

      setAppConfig(appConfig);
      setConfig(appConfig)
    }

    fetch('/api/env')
      .then((res) => res.json())
      .then((json) => setEnv(json));
  }, []);

  return (
    <>
    <div className="fixed bottom-0 left-0 bg-black/30 footer">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
        <label className="p-4 ml-4 text-gray-300 elative inline-flex items-center cursor-pointer">
          {envStatus == 'connected' ? (
            <BoltIcon className="h-7 w-7 pr-2 text-[hsl(210,70%,60%)]" />
          ) : (
            <ExclamationTriangleIcon className="h-7 w-7 pr-2 text-[hsl(25,70%,60%)]" />
          )}

          <i dangerouslySetInnerHTML={{ __html: envMsg }}></i>
        </label>

        <div className="mt-3.5 mr-3.5">
          <div className="float-right">
            <Cog8ToothIcon 
              className="h-8 w-8 pr-2 cursor-pointer text-white"
              onClick={() => setShowModal(true)} />
          </div>
        </div>
      </div>
    </div>
    {showModal && (
        <>
          <div className="popup text-black justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                  <h3 className="text-3xl font-semibold mr-6">
                    AI Content Wizard Configuration
                  </h3>
                  <XCircleIcon
                    className="h-8 w-8 fill-blue-500 cursor-pointer"
                    onClick={() => setShowModal(false)}
                  />
                </div>

                <div className="relative p-6 flex-auto">
                  <div className="mb-5">
                    
                    <FieldConfigSelect
                      inputChange={setAIModelSelect}
                      label="AI Model"
                      name="aiChoice"
                      optionMap={aiModelOptions}
                      defaultValue={appConfig.model}
                    />

                    <p className='text-xs text-black/60 pt-2 p-2 bg-sky-400/10 mt-2 rounded-lg font-light'>
                      OpenAI <a className='text-sky-500' target="_new" href="https://platform.openai.com/docs/models/overview">Models</a> and <a className='text-sky-500' target="_new" href="https://openai.com/pricing">Pricing</a>
                    </p>

                  </div>
                </div>

                <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                  <button
                    className="bg-blue-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    onClick={() => saveConfiguration()}
                    type="button"
                  >
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      )}
    </>
  );
}
