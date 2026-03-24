// src/components/Layout.js
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col">
      <Header />
      <Navigation />

      <div className="flex flex-col sm:flex-row pt-28">


        <main className="flex-1 p-4 sm:px-6 flex flex-col gap-8 items-center sm:items-start pb-28">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default Layout;