import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import React from "react";

const HomePage: NextPage = () => {
  return (
    <>
    <Head>
      <title>Liferay OpenAI Demo Content Wizard</title>
      <meta name="description" content="" />
      <link rel="icon" href="/favicon.ico" type="image/x-icon"/>
    </Head>
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
        Liferay <span className="text-[hsl(210,70%,50%)]">AI</span> Demo Wizard
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-8">

          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            href="/products"
          >
            <h3 className="text-2xl font-bold text-[hsl(210,70%,70%)]">Commerce Products →</h3>
            <div className="text-lg">
              Generate demo products and categories based on your company theme.
            </div>
          </Link>

          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            href="/blogs"
          >
            <h3 className="text-2xl font-bold text-[hsl(210,70%,70%)]">Blogs →</h3>
            <div className="text-lg">
              Create a set of blogs based on a suggested prompt.
            </div>
          </Link>

          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            href="/faqs"
          >
            <h3 className="text-2xl font-bold text-[hsl(210,70%,70%)]">FAQs →</h3>
            <div className="text-lg">
              Create a set of FAQs based on a suggested topic.
            </div>
          </Link>

          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            href="/news"
          >
            <h3 className="text-2xl font-bold text-[hsl(210,70%,70%)]">News →</h3>
            <div className="text-lg">
              Create a set of News Articles based on a suggested topic.
            </div>
          </Link>

          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            href="/objects"
          >
            <h3 className="text-2xl font-bold text-[hsl(210,70%,70%)]">Objects →</h3>
            <div className="text-lg">
              Populate your custom objects with records based on your prompts.
            </div>
          </Link>

          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            href="/users"
          >
            <h3 className="text-2xl font-bold text-[hsl(210,70%,70%)]">Users →</h3>
            <div className="text-lg">
              Create example users for your portal instance.
            </div>
          </Link>
          
        </div>
       
      </div>
    </main>
  </>
  );
};

export default HomePage;
