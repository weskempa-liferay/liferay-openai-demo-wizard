import { RocketLaunchIcon } from '@heroicons/react/24/solid';
import { NextPage } from 'next';
import { useState } from 'react';

import AppFooter from './components/appfooter';
import AppHead from './components/apphead';
import NavItem from './components/navitem';

const HomePage: NextPage = () => {
  const [debugMode, setDebugMode] = useState(false);

  return (
    <>
      <AppHead title="" />

      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-8 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Liferay <span className="text-[hsl(210,70%,50%)]">OpenAI</span>{' '}
            Content Wizard
            <RocketLaunchIcon className="inline pl-3 h-20 w-20 relative bottom-2 text-[hsl(210,50%,80%)]" />
          </h1>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 md:gap-8">
            <NavItem
              desc="Create a list of accounts based on a company type."
              path="/accounts"
              title="Accounts"
            />
            <NavItem
              desc="Create a set of blogs based on a suggested prompt."
              path="/blogs"
              title="Blogs"
            />
            <NavItem
              desc="Create a taxonomy and category structure based on a suggested theme."
              path="/categories"
              title="Categories"
            />
            <NavItem
              desc="Create a set of multilingual FAQs based on a suggested topic."
              path="/faqs"
              title="FAQs"
            />
            <NavItem
              desc="Create a set of knowledge base folders and articles based on a suggested topic."
              path="/knowledgebase"
              title="Knowledge Base"
            />
            <NavItem
              desc="In some cases, it is important to generate images with making associated content assets."
              path="/images"
              title="Images Only"
            />
            <NavItem
              desc="Create a set of message board sections and threads based on a suggested topic."
              path="/messageboard"
              title="Message Board"
            />
            <NavItem
              desc="Create a set of multilingual news articles based on a suggested topic."
              path="/news"
              title="News"
            />
            <NavItem
              desc="Populate your custom objects with records based on your prompts."
              path="/objects"
              title="Objects"
            />
            <NavItem
              desc="Create a organizational structure for your company."
              path="/organizations"
              title="Organizations"
            />
            <NavItem
              desc="Generate demo products and categories based on your company theme."
              path="/products"
              title="Products"
            />
            <NavItem
              desc="Create example users for your portal instance."
              path="/users"
              title="Users"
            />
          </div>
        </div>

        <AppFooter debugModeChange={setDebugMode} />
      </main>
    </>
  );
};

export default HomePage;
