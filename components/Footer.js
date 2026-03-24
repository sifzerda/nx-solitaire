import Image from "next/image";

function Footer() {
  return (
    <footer className="w-full fixed bottom-0 left-0 z-20 border-t-2 border-borderblue bg-white dark:bg-black text-sm text-gray-600 dark:text-gray-400">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-center items-center gap-4">
        <div className="flex flex-wrap justify-center items-center gap-4">

          {/* ================================================= */}
          <a
            href="https://react-td-portfolio.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 text-white"
          >
            <Image
              src="/mammal.svg"
              alt="Mammal"
              width={18}
              height={18}
              className="transition"
            />
            <span className="transition group-hover:text-red-500">sifzerda</span>
          </a>

          {/* ================================================= */}
          <a
            href="https://github.com/sifzerda/next-horror"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 text-white"
          >
            <Image
              src="/github.svg"
              alt="Github"
              width={16}
              height={16}
              className="transition"
            />
            <span className="transition group-hover:text-red-500">2025</span>
          </a>
          {/* ================================================= */}
        </div>
      </div>
    </footer>

  );
}

export default Footer;
