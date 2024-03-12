import {
  BoltIcon,
  Cog8ToothIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import Cookies from 'universal-cookie';

import functions from '../../utils/functions';
import ConfigModal from '../config-modal';

const cookies = new Cookies();

export const APP_CONFIG = 'ai-wizard-config';

const getBase64data = (login: string, password: string) => {
  const usernamePasswordBuffer = Buffer.from(login + ':' + password);

  return usernamePasswordBuffer.toString('base64');
};

export default function AppFooter() {
  const [envMsg, setEnvMsg] = useState('&nbsp;');
  const [envStatus, setEnvStatus] = useState('connected');

  const [showModal, setShowModal] = useState(false);
  const [appConfig, setAppConfig] = useState({
    base64data: '',
    login: 'test@liferay.com',
    model: functions.getDefaultAIModel(),
    openAIKey: '',
    serverURL: 'http://localhost:8080',
  });

  const setEnv = (response) => {
    setEnvMsg(response.result);
    setEnvStatus(response.status);
  };

  const getConfigObject = (config: any) => {
    return {
      ...config,
      base64data: getBase64data(config.login, config.password),
    };
  };

  const saveConfiguration = (config) => {
    const newConfig = getConfigObject(config);

    setAppConfig(newConfig);

    cookies.set(APP_CONFIG, newConfig, {
      expires: new Date(Date.now() + 2592000),
      path: '/',
    });

    setShowModal(false);

    checkConfig(newConfig);
  };

  useEffect(() => {
    if (cookies.get(APP_CONFIG)) {
      let appConfig = cookies.get(APP_CONFIG);

      console.log('Using existing appConfig');
      console.log(appConfig);

      setAppConfig(appConfig);
      checkConfig(appConfig);
    } else {
      checkConfig(appConfig);
    }
  }, []);

  const checkConfig = (appConfig) => {
    fetch('/api/env', {
      body: JSON.stringify(appConfig),
      method: 'POST',
    })
      .then((res) => res.json())
      .then((json) => setEnv(json));
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 bg-black/30 footer">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          <label
            className="p-4 ml-4 text-gray-300 elative inline-flex items-center cursor-pointer"
            onClick={() => setShowModal(true)}
          >
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
        <ConfigModal
          appConfig={appConfig}
          saveConfiguration={saveConfiguration}
          setShowModal={setShowModal}
        />
      )}
    </>
  );
}
