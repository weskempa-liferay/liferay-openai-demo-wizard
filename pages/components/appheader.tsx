import React from "react";
import Link from "next/link";

export default function AppHeader({title,desc}) {

    return(
        <>
            <div className="fixed top-0 left-5 p-5">
                <Link
                className="rounded-xl p-1 text-white "
                href="/"
                >
                <h3 className="text-1xl font-bold text-[hsl(210,70%,70%)]">← Return to Index</h3>
                </Link>
            </div>
            
            <h3 className="text-slate-200 font-bold text-3xl mb-3">
                {title}
            </h3>
            <p className="text-slate-400 text-center text-lg mb-10">
                <i dangerouslySetInnerHTML={{ __html: desc }}></i>
            </p>
        </>
    )
}