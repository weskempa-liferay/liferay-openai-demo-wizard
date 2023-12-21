import { useState, useEffect } from "react";

export default function FieldString({name,label,inputChange,placeholder,defaultValue}) {

    const [input, setInput] = useState(defaultValue);

    const handleInputChange = (value) => {
      setInput(value);
      inputChange(value);
    };

    useEffect(() => {

        setInput(defaultValue);

      }, []);

    return(
        <label className="flex flex-col text-slate-200">
          {label}
          <input
              className="text-sm text-gray-base w-full 
                                mr-3 py-5 px-4 h-2 border 
                                border-gray-200 text-slate-700 rounded"
              type="text"
              name={name}
              placeholder={placeholder}
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
            />
        </label>
    )
}