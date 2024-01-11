import AppFooter from './components/appfooter';
import AppHead from './components/apphead';
import AppHeader from './components/appheader';
import NavItem from './components/navitem';

export default function Users() {
  return (
    <div>
      <AppHead title="User Generation Options" />

      <main className="py-20 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        <AppHeader
          desc="How would you like to add users?"
          title="Liferay User Generator"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          <NavItem
            description="Use OpenAI to generate a list of random demo users."
            path="/users-ai"
            title="AI Generation"
          />

          <NavItem
            description="Upload a list of specific users from a CSV file."
            path="/users-file"
            title="CSV Upload"
          />
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
