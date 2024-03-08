export default function FieldFile({ accept, inputChange, label, name }) {
  return (
    <label
      className="block mb-2 text-sm font-medium text-gray-200"
      htmlFor={name}
    >
      {label}
      <input
        accept={accept}
        className="block w-full mt-1 text-sm text-gray-900 border border-gray-300 p-4 rounded-lg cursor-pointer bg-white focus:outline-none"
        id={name}
        name={name}
        onChange={inputChange}
        type={'file'}
      />
    </label>
  );
}
