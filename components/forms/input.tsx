import { useFormContext } from 'react-hook-form';

import { ErrorMessage } from './error-message';

export default function Input({ label, name, placeholder = '', ...props }) {
  const { register } = useFormContext();

  return (
    <label className="flex flex-col text-slate-300 font-medium">
      {label}
      <input
        className="text-sm text-gray-base w-full mr-3 py-5 px-4 h-2 border border-gray-200 font-normal text-slate-700 rounded"
        name={name}
        placeholder={placeholder}
        type="text"
        {...props}
        {...register(name)}
      />

      <ErrorMessage field={name} />
    </label>
  );
}
