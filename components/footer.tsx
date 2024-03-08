import {
  BoltIcon,
  Cog8ToothIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import Cookies from 'universal-cookie';

import FieldPassword from '../components/formfield-password';
import FieldString from '../components/formfield-string';
import functions from '../utils/functions';
import FieldConfigSelect from './formfield-config-select';

const cookies = new Cookies();

export default function AppFooter({ setConfig }) {
  const [envMsg, setEnvMsg] = useState('&nbsp;');
  const [envStatus, setEnvStatus] = useState('connected');

  const [showModal, setShowModal] = useState(false);

  const [aiModelSelect, setAIModelSelect] = useState(functions.getDefaultAIModel());
  const [serverURL, setServerURL] = useState('');
  const [openAIKey, setOpenAIKey] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [base64data, setBase64data] = useState('');

  const [appConfig, setAppConfig] = useState({
    base64data:'',
    login:'',
    model:functions.getDefaultAIModel(),
    openAIKey:'',
    serverURL:''
  });

  const aiModelOptions = functions.getAIModelOptions();
  const APP_CONFIG = "ai-wizard-config";

  const setEnv = (response) => {
    setEnvMsg(response.result);
    setEnvStatus(response.status);
  };

  const getConfigObject = () => {
    return {
      base64data:base64data,
      login:login,
      model:aiModelSelect,
      openAIKey:openAIKey,
      serverURL:serverURL
    };
  }

  useEffect(() => {

    setBase64data(getBase64data());

  }, [login,password]);


  const enterPressed = () => {
    saveConfiguration();
  }

  const saveConfiguration = () => {

    setAppConfig(getConfigObject());
    setConfig(getConfigObject());

    cookies.set(
      APP_CONFIG,
      getConfigObject(),
      {
        expires: new Date(Date.now()+2592000),
        path: '/'
      }
    );

    setShowModal(false);
    
    checkConfig(getConfigObject());

  };

  useEffect(() => {
    if(!cookies.get(APP_CONFIG)){

      checkConfig(appConfig);

    } else {
      let appConfig = cookies.get(APP_CONFIG);

      console.log("Using existing appConfig");
      //console.log(appConfig);

      setAIModelSelect(appConfig.model);
      setServerURL(appConfig.serverURL);
      setOpenAIKey(appConfig.openAIKey);
      setLogin(appConfig.login);
      setBase64data(appConfig.base64data);

      setAppConfig(appConfig);
      setConfig(appConfig)

      checkConfig(appConfig);
    }
    

  }, []);

  const checkConfig = (appConfig) => {
    
    fetch('/api/env',
      {
        body: JSON.stringify(appConfig), 
        method: "POST", 
      })
      .then((res) => res.json())
      .then((json) => setEnv(json));
  };

  const getBase64data = () => {
    const usernamePasswordBuffer = Buffer.from(
      login + ':' + password
    );
  
    return usernamePasswordBuffer.toString('base64');
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 bg-black/30 footer">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          <label className="p-4 ml-4 text-gray-300 elative inline-flex items-center cursor-pointer" 
                onClick={() => setShowModal(true)}>
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
                onClick={() => setShowModal(true)}
              />
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


                    <div className="mb-2 p-3 bg-blue-500/20 rounded-lg font-normal">
                      <div className="mb-2">
                        
                          <FieldString
                            defaultValue=""
                            inputChange={setOpenAIKey}
                            label="OpenAI Key"
                            name="openAIKey"
                            placeholder="Enter an openai key"
                          />

                        <FieldConfigSelect
                          defaultValue={appConfig.model}
                          inputChange={setAIModelSelect}
                          label="AI Model"
                          name="aiChoice"
                          optionMap={aiModelOptions}
                        />

                        <p className="text-xs text-black/60 pt-2 mt-4 p-2 bg-sky-400/20 mt-2 rounded-lg font-normal">
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

                    <div className="p-3 bg-green-600/30 rounded-lg">
                        <FieldString
                          defaultValue="test@liferay.com"
                          inputChange={setLogin}
                          label="User Login"
                          name="userLogin"
                          placeholder="Enter user login"
                        />
                                
                        <FieldPassword
                          defaultValue=""
                          enterPressed={enterPressed}
                          inputChange={setPassword}
                          label="Password"
                          name="password"
                          placeholder="Enter password (Password is never saved directly)"
                        />

                        <FieldString
                          defaultValue="http://localhost:8080"
                          inputChange={setServerURL}
                          label="Set Server URL"
                          name="serverURL"
                          placeholder="Enter server url"
                        />
                      </div>
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
