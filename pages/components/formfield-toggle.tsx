import { useState, useEffect } from "react";

export default function FieldToggle({name, fieldKey, defaultValue, inputChange}) {

    const [toggleState, setToggleState] = useState(defaultValue);

    const handleInputChange = (toggle) => {
        
        setToggleState(!toggleState);
        inputChange({
            "name": name,
            "fieldKey": fieldKey,
            "value": !toggleState
            });
    };

    useEffect(() => {
        setToggleState(defaultValue);
      }, []);

    return(
        <label className="toggle elative inline-flex items-center cursor-pointer">
            <input type="checkbox" name={fieldKey} checked={toggleState} onChange={handleInputChange} className="sr-only peer"/>
            <div className="absolute w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-400 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ms-1 text-sm font-medium text-gray-900 dark:text-gray-300">{name}</span>
        </label>
    )
}