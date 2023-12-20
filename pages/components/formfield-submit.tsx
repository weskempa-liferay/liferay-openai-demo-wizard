export default function FieldSubmit({label,disabled}) {
    return(
        <button disabled={disabled} type="submit"
            className="text-sm w-full font-extrabold bg-blue-600 h-10 text-white rounded-2xl mb-10 tracking-wide">
                {label}
        </button>
    )
}