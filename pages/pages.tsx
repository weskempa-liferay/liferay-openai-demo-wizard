import Layout from '../components/layout';
import NavItem from '../components/navitem';

export default function Pages() {
  return (
    <Layout
      description='How would you like to add users?'
      title='Liferay Page Generator'
    >
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8'>
        <NavItem
          description='Use OpenAI to generate a page hierarchy.'
          path='/pages-ai'
          title='AI Generation'
        />

        <NavItem
          description='Upload a page hierarchy using a json file.'
          path='/pages-file'
          title='File Upload'
        />
      </div>
    </Layout>
  );
}
