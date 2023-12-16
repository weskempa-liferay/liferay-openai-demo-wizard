
import { useState, useEffect } from "react";
import React from "react";
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid'
import { XCircleIcon } from '@heroicons/react/24/solid'

import Cookies from 'universal-cookie';
const cookies = new Cookies();


export default function AppImageStyle({styleInputChange}) {

    const [showModal, setShowModal] = useState(false);  
    const [imageStyleInput, setImageStyleInput] = useState("");  
    const [imageStyleList, setImageStyleList] = useState([]);  

    useEffect(() => {
        //TODO Choose from Cookie

        fetch("/api/imagestyles")
        .then(res => res.json())
        .then(json => processImageStyleList(json.result));

      }, []);

    const processImageStyleList = (data) => {
        console.log(JSON.parse(data));
        setImageStyleList(JSON.parse(data));
    }

    const imageStyleChange = (style) => {
        styleInputChange(style);
        setImageStyleInput(style);
    }
    
    const clearStyleChoice = () => {
        imageStyleChange("");
        setShowModal(false);
    }
    
    const setStyleChoice = (choice) => {
        imageStyleChange(choice);
        setShowModal(false);
    }
    const formatStyleName = (nameStr) => {
        return nameStr
                .replaceAll(".png","")
                .replaceAll("style-","")
                .replaceAll("-"," ");
    }


    return(
        <label className="flex max-w-xs flex-col text-slate-200 pr-18 relative">
            Image Style
            <input
                className="text-sm text-gray-base w-full 
                            py-5 px-4 h-2 border 
                            border-gray-200 text-slate-700 rounded"
                type="text"
                name="imageStyle"
                placeholder="OpenAI's Choice"
                value={imageStyleInput}
                onChange={(e) => imageStyleChange(e.target.value)}
            />

            <button
                className="btn-popuptoggle bg-blue-500 text-white active:bg-blue-600 font-bold uppercase text-sm px-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
                onClick={() => setShowModal(true)}
            >
                <ArrowUpTrayIcon className="h-5 w-5 text-white" />
            </button>
            {showModal ? (
                <>
                <div
                    className="text-black justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
                >
                    <div className="relative w-auto my-6 mx-auto max-w-3xl">
                    {/*content*/}
                    <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                        {/*header*/}
                        <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                            <h3 className="text-3xl font-semibold">
                                Suggested Image Styles
                            </h3>
                            <XCircleIcon className="h-8 w-8 fill-blue-500 cursor-pointer"
                                onClick={() => setShowModal(false)} />
                        </div>
                        
                        <div className="relative p-6 flex-auto">               
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 md:gap-4 mb-5">

                                {Object.entries(imageStyleList).map(([key,value], index) => {
                                    return (
                                      
                                        <div key={index} className="relative" 
                                            onClick={() => setStyleChoice(formatStyleName(value))}>
                                            <img className="border-2 border-blue-300 hover:border-blue-600 cursor-pointer shadow-md" src={"/images/art-styles/"+value} />
                                            <label className="bg-slate-900/70 text-white w-full block text-center absolute right-0 bottom-0 capitalize">{formatStyleName(value)}</label>
                                        </div>

                                    )})
                                }

                            </div>
                        </div>
                        
                        <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                            <button
                                className="bg-blue-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                type="button"
                                onClick={() => clearStyleChoice()}
                            >
                                Clear Style Choice
                            </button>
                        </div>

                    </div>
                    </div>
                </div>
                <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
                </>
            ) : null}
        </label>
    )
}