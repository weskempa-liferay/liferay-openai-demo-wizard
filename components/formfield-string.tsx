import { useEffect, useState } from 'react';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

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

    cookies.set(name, value, { path: '/' });
  };

  useEffect(() => {
    setInput(defaultValue);
    if (!cookies.get(name)) {
      cookies.set(name, false, { path: '/' });
    } else {
      setInput(cookies.get(name));
      inputChange(cookies.get(name));
    }
  }, []);

  return (
    <label className="flex flex-col text-slate-200">
      {label}
      <input
        className="text-sm text-gray-base w-full mr-3 py-5 px-4 h-2 border border-gray-200 text-slate-700 rounded"
        name={name}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={placeholder}
        type="text"
        value={input}
      />
    </label>
  );
}
