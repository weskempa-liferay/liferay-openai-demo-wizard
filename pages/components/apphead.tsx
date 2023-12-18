import React from "react";
import Head from "next/head";

export default function AppHead({title}) {

    return(
        <Head>
            <title>Liferay OpenAI Demo Content Wizard - {title}</title>
            <meta name="description" content="" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
    )
}