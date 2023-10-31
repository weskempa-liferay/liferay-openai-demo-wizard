import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import React from "react";

const HomePage: NextPage = () => {
  return (
    <>
    <Head>
      <title>Liferay OpenAI Demo Wizard</title>
      <meta name="description" content="" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
        Liferay <span className="text-[hsl(280,100%,70%)]">AI</span> Demo Wizard
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            href="/review"
          >
            <h3 className="text-2xl font-bold">Commerce Products →</h3>
            <div className="text-lg">
              Generate demo specific product and categories.
            </div>
          </Link>
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            href="/short-story"
      
          >
            <h3 className="text-2xl font-bold">Blog or somthing?</h3>
            <div className="text-lg">
              Create a blog based on a suggested topic.
            </div>
          </Link>
        </div>
       
      </div>
    </main>
  </>
  );
};

export default HomePage;
