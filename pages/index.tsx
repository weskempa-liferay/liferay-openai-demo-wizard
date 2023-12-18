import { NextPage } from "next";
import {useState} from "react";
import AppHead from "./components/apphead";
import AppFooter from "./components/appfooter";
import NavItem from "./components/navitem";

import { RocketLaunchIcon } from '@heroicons/react/24/solid';

const HomePage: NextPage = () => {

  const [debugMode, setDebugMode] = useState(false);

  const onDebugModeChange = (value) => {
    setDebugMode(value);
  };

  return (
  <>
    <AppHead title={""}/>
    
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-8 ">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Liferay <span className="text-[hsl(210,70%,50%)]">AI</span> Content Wizard 
          <RocketLaunchIcon className="inline pl-3 h-20 w-20 relative bottom-2 text-[hsl(210,50%,80%)]" />
        </h1>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 md:gap-8">

          <NavItem title={"Blogs"}          path={"/blogs"}           desc={"Create a set of blogs based on a suggested prompt."} />
          <NavItem title={"FAQs"}           path={"/faqs"}            desc={"Create a set of FAQs based on a suggested topic."} />
          <NavItem title={"Knowledge Base"} path={"/knowledgebase"}   desc={"Create a set of Knowledge Base Folders and Articles based on a suggested topic."} />
          <NavItem title={"Message Board"}  path={"/messageboard"}    desc={"Create a set of Message Board Sections and Threads based on a suggested topic."} />
          <NavItem title={"News"}           path={"/news"}            desc={"Create a set of News Articles based on a suggested topic."} />
          <NavItem title={"Objects"}        path={"/objects"}         desc={"Populate your custom objects with records based on your prompts."} />
          <NavItem title={"Products"}       path={"/products"}        desc={"Generate demo products and categories based on your company theme."} />
          <NavItem title={"Users"}          path={"/users"}           desc={"Create example users for your portal instance."} />
          
        </div> 
      </div>

      <AppFooter debugModeChange={onDebugModeChange} />

    </main>
  </>
  );
};

export default HomePage;
