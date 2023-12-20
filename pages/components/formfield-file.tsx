import { useState, useEffect } from "react";

export default function FieldFile({name,label,inputChange}) {

    return(
        <label  className="block mb-2 p-4 text-sm font-medium text-gray-900 dark:text-white" htmlFor={name}>
          {label}
          <input
                className="block w-full text-sm text-gray-900 border border-gray-300 p-4 
                          rounded-lg cursor-pointer bg-gray-90 dark:text-gray-900 focus:outline-none 
                          dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
                type={"file"}
                accept={".csv"}
                name={name}
                id={name}
                onChange={inputChange}
            />
        </label>
    )
}