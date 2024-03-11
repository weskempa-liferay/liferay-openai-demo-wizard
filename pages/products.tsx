import Layout from '../components/layout';
import NavItem from '../components/navitem';

export default function Products() {
  return (
    <Layout
      description='How would you like to add products?'
      title='Liferay Product Generator'
    >
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8'>
        <NavItem
          description='Use OpenAI to generate a list of demo products based on a theme.'
          path='/products-ai'
          title='AI Generation'
        />

        <NavItem
          description='Upload a list of specific products from a CSV file.'
          path='/products-file'
          title='File Upload'
        />
      </div>
    </Layout>
  );
}
