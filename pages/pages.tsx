import AppFooter from './components/appfooter';
import AppHead from './components/apphead';
import AppHeader from './components/appheader';
import NavItem from './components/navitem';

export default function Users() {

  const setAppConfig = () => {}
  
  return (
    <div>
      <AppHead title="Page Generation Options" />

      <main className="py-20 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        <AppHeader
          desc="How would you like to add users?"
          title="Liferay Page Generator"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          <NavItem
            description="Use OpenAI to generate a page hierarchy."
            path="/pages-ai"
            title="AI Generation"
          />

          <NavItem
            description="Upload a page hierarchy using a json file."
            path="/pages-file"
            title="File Upload"
          />
        </div>
      </main>

      <AppFooter setConfig={setAppConfig}/>
    </div>
  );
}
