import { useFormContext } from 'react-hook-form';

import { ErrorMessage } from './error-message';

export default function Select({
  defaultOption = true,
  defaultValue = undefined,
  label,
  name,
  optionMap,
}) {
  const { register } = useFormContext();

  return (
    <label className="flex flex-col text-slate-300 font-medium">
      {label}

      <select
        className="bg-white border border-gray-200 text-slate-700 font-normal text-sm rounded block w-full p-2.5 h-10"
        defaultValue={defaultValue}
        id={name}
        name={name}
        {...register(name)}
      >
        {defaultOption && <option value="">Select...</option>}

        {optionMap.map((option) => {
          return (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          );
        })}
      </select>

      <ErrorMessage field={name} />
    </label>
  );
}
