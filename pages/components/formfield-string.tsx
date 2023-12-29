import { useEffect, useState } from 'react';

export default function FieldString({
  defaultValue,
  inputChange,
  label,
  name,
  placeholder,
}) {
  const [input, setInput] = useState(defaultValue);

  const handleInputChange = (value) => {
    setInput(value);
    inputChange(value);
  };

  useEffect(() => {
    setInput(defaultValue);
  }, []);

  return (
    <label className="flex flex-col text-slate-200">
      {label}
      <input
        className="text-sm text-gray-base w-full 
                                mr-3 py-5 px-4 h-2 border 
                                border-gray-200 text-slate-700 rounded"
        name={name}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={placeholder}
        type="text"
        value={input}
      />
    </label>
  );
}
