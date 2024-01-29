export default function FieldConfigSelect({ inputChange, label, name, optionMap, defaultValue }) {
  return (
    <label className="flex flex-col text-slate-200">
      {label}
      <select
        className="bg-white border border-gray-200 
                    text-slate-700 text-sm rounded
                    block w-full p-2.5 h-10"
        id={name}
        name={name}
        onChange={(e) => inputChange(e.target.value)}
        defaultValue={defaultValue}
      >
        {optionMap.map((option) => {
          return (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          );
        })}
      </select>
    </label>
  );
}
