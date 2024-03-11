import AppHead from '../head';
import AppFooter from './footer';
import AppHeader from './header';

export default function Layout({ children, description, title }) {
  return (
    <>
      <AppHead title={title} />

      <main className='py-20 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]'>
        <AppHeader desc={description} title={title} />

        {children}
      </main>

      <AppFooter />
    </>
  );
}
