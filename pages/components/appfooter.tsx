import { useState, useEffect } from "react";
import React from "react";

import Cookies from 'universal-cookie';
const cookies = new Cookies();

import { BoltIcon } from '@heroicons/react/24/solid';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

export default function AppFooter({debugModeChange}) {

    const [envMsg, setEnvMsg] = useState(".");
    const [envStatus, setEnvStatus] = useState("");
    const [debugMode, setDebugMode] = useState(cookies.get('debug'));  

    const handleDebugModeChange = () => {
      setDebugMode(!debugMode);

      cookies.set('debug', !debugMode, { path: '/' });

      debugModeChange(!debugMode);
    };

    const setEnv = (response) => {
        setEnvMsg(response.result);
        setEnvStatus(response.status);
    }

    useEffect(() => {
        
        fetch("/api/env")
        .then(res => res.json())
        .then(json => setEnv(json));

        if(!cookies.get('debug')) cookies.set('debug', false, { path: '/' });
        
        setDebugMode(cookies.get('debug'));
        debugModeChange(cookies.get('debug'));

      }, []);

    return(
        <div className="fixed bottom-0 left-0 bg-black/30 footer">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
                
                <label className="p-4 ml-4 text-gray-300 elative inline-flex items-center cursor-pointer">
                    {envStatus=="connected" ?
                        (
                            <BoltIcon className="h-7 w-7 pr-2 text-[hsl(210,70%,60%)]" />
                        ) : (
                            <ExclamationTriangleIcon className="h-7 w-7 pr-2 text-[hsl(25,70%,60%)]" />
                        ) }
                    
                    <i dangerouslySetInnerHTML={{ __html: envMsg }}></i>
                </label>
            
                <label className="imgtoggle elative inline-flex items-center cursor-pointer right-0 absolute">
                    <input type="checkbox" checked={debugMode} onChange={handleDebugModeChange} className="sr-only peer"/>
                    <div className="absolute w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Debug Mode</span>
                </label>
                
            </div>
        </div>
    )
}