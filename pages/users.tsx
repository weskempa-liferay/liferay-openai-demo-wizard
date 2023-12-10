import Head from "next/head";
import Link from "next/link";
import React from "react";

export default function Review() {
  return (
    <div>
    <Head>
      <title>Liferay OpenAI Demo Content Wizard - USers</title>
      <meta name="description" content="" />
      <link rel="icon" href="/favicon.ico" type="image/x-icon"/>
    </Head>
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
      
      <div className="fixed top-0 left-5 p-5">
        <Link
          className="rounded-xl p-1 text-white "
          href="/"
        >
          <h3 className="text-1xl font-bold text-[hsl(210,70%,70%)]">← Return to Index</h3>
        </Link>
      </div>
      
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h3 className="text-slate-200 font-bold text-3xl">
          Liferay User Generator
        </h3>
        <p className="text-slate-400 text-center text-lg mb-10">
          <i>How would you like to add users?</i>
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">

          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            href="/users-file"
          >
            <h3 className="text-2xl font-bold text-[hsl(210,70%,70%)]">CSV Upload →</h3>
            <div className="text-lg">
              Upload a list of specific users from a CSV file.
            </div>
          </Link>

          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            href="/users-ai"
          >
            <h3 className="text-2xl font-bold text-[hsl(210,70%,70%)]">AI Generation →</h3>
            <div className="text-lg">
              Use OpenAI to generate a list of random demo users.
            </div>
          </Link>
          
        </div>
       
      </div>
    </main>
  </div>
  );
};
