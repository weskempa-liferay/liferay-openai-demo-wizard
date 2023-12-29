export default function FieldFile({ inputChange, label, name }) {
  return (
    <label
      className="block mb-2 p-4 text-sm font-medium text-gray-900 dark:text-white"
      htmlFor={name}
    >
      {label}
      <input
        accept={'.csv'}
        className="block w-full text-sm text-gray-900 border border-gray-300 p-4 
                          rounded-lg cursor-pointer bg-gray-90 dark:text-gray-900 focus:outline-none 
                          dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
        id={name}
        name={name}
        onChange={inputChange}
        type={'file'}
      />
    </label>
  );
}
