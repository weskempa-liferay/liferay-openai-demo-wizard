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
    description: 'Create a set of blogs based on a suggested prompt.',
    path: '/blogs',
    title: 'Blogs',
  },
  {
    description:
      'Create a taxonomy and category structure based on a suggested theme.',
    path: '/categories',
    title: 'Categories',
  },
  {
    description:
      'Create a set of multilingual FAQs based on a suggested topic.',
    path: '/faqs',
    title: 'FAQs',
  },
  {
    description:
      'Create a set of knowledge base folders and articles based on a suggested topic.',
    path: '/knowledgebase',
    title: 'Knowledge Base',
  },
  {
    description:
      'In some cases, it is important to generate images with making associated content assets.',
    path: '/images',
    title: 'Images Only',
  },
  {
    description:
      'Create a set of message board sections and threads based on a suggested topic.',
    path: '/messageboard',
    title: 'Message Board',
  },
  {
    description:
      'Create a set of multilingual news articles based on a suggested topic.',
    path: '/news',
    title: 'News',
  },
  {
    description:
      'Populate your custom objects with records based on your prompts.',
    path: '/objects',
    title: 'Objects',
  },
  {
    description: 'Create a organizational structure for your company.',
    path: '/organizations',
    title: 'Organizations',
  },
  {
    description:
      'Generate demo products and categories based on your company theme.',
    path: '/products',
    title: 'Products',
  },
  {
    description: 'Create example users for your portal instance.',
    path: '/users',
    title: 'Users',
  },
];

const HomePage = () => {
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
