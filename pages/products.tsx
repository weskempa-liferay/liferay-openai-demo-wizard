import AppFooter from './components/appfooter';
import AppHead from './components/apphead';
import AppHeader from './components/appheader';
import NavItem from './components/navitem';

export default function Products() {
  return (
    <div>
      <AppHead title="Product Generation Options" />

      <main className="py-20 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        <AppHeader
          desc="How would you like to add products?"
          title="Liferay Product Generator"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          <NavItem
            description="Upload a list of specific products from a CSV file."
            path="/products-file"
            title="CSV Upload"
          />

          <NavItem
            description="Use OpenAI to generate a list of demo products based on a theme."
            path="/products-ai"
            title="AI Generation"
          />
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
