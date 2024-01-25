import { RocketLaunchIcon } from '@heroicons/react/24/solid';

import AppFooter from './components/appfooter';
import AppHead from './components/apphead';
import NavItem from './components/navitem';

const navItems = [
  {
    description: 'Create a list of accounts based on a company type.',
    path: '/accounts',
    title: 'Accounts',
  },
  {
    description: 'Create a set of blogs based on a prompt.',
    path: '/blogs',
    title: 'Blogs',
  },
  {
    description:
      'Create a taxonomy and category structure based on a theme.',
    path: '/categories',
    title: 'Categories',
  },
  {
    description:
      'Create a set of multilingual FAQs based on a topic.',
    path: '/faqs',
    title: 'FAQs',
  },
  {
    description:
      'Create knowledge base folders and articles based on a topic.',
    path: '/knowledgebase',
    title: 'Knowledge Base',
  },
  {
    description:
      'Generate images into a document library folder based on a prompt.',
    path: '/images',
    title: 'Images Only',
  },
  {
    description:
      'Choose a topic to create message board sections and threads.',
    path: '/messageboard',
    title: 'Message Board',
  },
  {
    description:
      'Create a set of multilingual news articles based on a topic.',
    path: '/news',
    title: 'News',
  },
  {
    description:
      'Populate a custom objects with records based on a prompt.',
    path: '/objects',
    title: 'Objects',
  },
  {
    description: 'Create a organizational structure for a company.',
    path: '/organizations',
    title: 'Organizations',
  },
  {
    description:
      'Generate a page hierarchy from a description of the goal of a site.',
    path: '/pages',
    title: 'Page Hierarchies',
  },
  {
    description:
      'Use a company theme to generate products and categories.',
    path: '/products',
    title: 'Products',
  },
  {
    description: 'Create example users for a portal instance.',
    path: '/users',
    title: 'Users',
  },
  {
    description: 'Create example user groups for a portal instance.',
    path: '/usergroups',
    title: 'User Groups',
  },
  {
    description: 'Create a set of warehouses in a given region.',
    path: '/warehouses',
    title: 'Warehouses',
  },
  {
    description: 'Create a set of wiki nodes and pages based on a prompt.',
    path: '/wikis',
    title: 'Wikis',
  }
];

const HomePage = () => {
  return (
    <>
      <AppHead title="" />

      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 pt-6 pb-20">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-[4rem]">
            Liferay <span className="text-[hsl(210,70%,50%)]">OpenAI</span> Content Wizard
            <RocketLaunchIcon className="inline pl-3 h-20 w-20 relative bottom-2 text-[hsl(210,50%,80%)]" />
          </h1>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 md:gap-8">
            {navItems.map((navItem, index) => (
              <NavItem {...navItem} key={index} />
            ))}
          </div>
        </div>

        <AppFooter />
      </main>
    </>
  );
};

export default HomePage;