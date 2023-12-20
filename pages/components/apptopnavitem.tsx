import Link from "next/link";

export default function AppHeader({label,onClick}) {

    return(
        <button id="structure-download" className="mr-2 bg-gray-200 hover:bg-grey text-grey-lightest font-bold py-2 px-4 rounded inline-flex items-center" onClick={onClick}>
            <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
            <span>{label}</span>
        </button>
    )
}