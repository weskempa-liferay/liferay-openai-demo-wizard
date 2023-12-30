export default function FieldSubmit({ disabled, label }) {
  return (
    <button
      className="text-sm w-full font-extrabold bg-blue-600 h-10 text-white rounded-2xl mb-10 tracking-wide"
      disabled={disabled}
      type="submit"
    >
      {label}
    </button>
  );
}
