// src/components/Header.js
'use client';

import Image from "next/image";

function Header() {
  return (
    <header
      role="banner"
      className="w-full h-12 bg-black text-white px-6 flex items-center justify-between fixed top-0 left-0 z-40 sm:pl-64"
    >
      <div className="flex items-center gap-2 h-full">
        <div className="relative h-full w-8"> 
          {/* Constrain height to header (48px), width adjusts automatically */}
          <Image
            src="/vercel.svg" // Replace with your logo path
            alt="Site Logo"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
        <span className="text-sm sm:text-base font-semibold">My Website</span>
      </div>

      <div className="text-sm sm:text-base font-semibold">My Website</div>
      <div className="text-xs sm:text-sm">Welcome back</div>
    </header>
  );
}

export default Header;
