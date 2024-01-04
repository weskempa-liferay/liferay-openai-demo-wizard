export default function FieldFile({ inputChange, label, name }) {
  return (
    <label
      className="block mb-2 p-4 text-sm font-medium text-gray-900"
      htmlFor={name}
    >
      {label}
      <input
        accept={'.csv'}
        className="block w-full text-sm text-gray-900 border border-gray-300 p-4 rounded-lg cursor-pointer bg-white focus:outline-none"
        id={name}
        name={name}
        onChange={inputChange}
        type={'file'}
      />
    </label>
  );
}
