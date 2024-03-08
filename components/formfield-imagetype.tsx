export default function FieldImageType({ includeNone, inputChange }) {
  return (
    <label className="flex flex-col text-slate-200">
      Image Generation
      <select
        className="bg-white border border-gray-200 text-slate-700 text-sm rounded block w-full p-2.5"
        id="imageGenerationType"
        name="imageGenerationType"
        onChange={(event) => inputChange(event.target.value)}
      >
        {includeNone && <option value="none">None</option>}
        <option value="dall-e-3">DALL·E 3 (Highest-Quality Images)</option>
        <option value="dall-e-2">DALL·E 2 (Basic Images)</option>
      </select>
    </label>
  );
}
