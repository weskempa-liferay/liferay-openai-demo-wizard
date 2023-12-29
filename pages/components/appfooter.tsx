import { BoltIcon } from '@heroicons/react/24/solid';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';

export default function AppFooter() {
  const [envMsg, setEnvMsg] = useState('&nbsp;');
  const [envStatus, setEnvStatus] = useState('connected');

  const setEnv = (response) => {
    setEnvMsg(response.result);
    setEnvStatus(response.status);
  };

  useEffect(() => {
    fetch('/api/env')
      .then((res) => res.json())
      .then((json) => setEnv(json));
  }, []);

  return (
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

        <label className="imgtoggle elative inline-flex items-center cursor-pointer right-0 absolute">
          <span className="text-xs font-medium text-gray-900 dark:text-gray-300">
            Debug - Open console
          </span>
        </label>
      </div>
    </div>
  );
}
