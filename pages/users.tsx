import Layout from '../components/layout';
import NavItem from '../components/navitem';

export default function Users() {
  return (
    <Layout
      description="How would you like to add users?"
      setAppConfig={() => null}
      title="Liferay User Generator"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
        <NavItem
          description="Use OpenAI to generate a list of random demo users."
          path="/users-ai"
          title="AI Generation"
        />

        <NavItem
          description="Upload a list of specific users from a CSV file."
          path="/users-file"
          title="File Upload"
        />
      </div>
    </Layout>
  );
}
