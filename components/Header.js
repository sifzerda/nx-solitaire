// src/components/Header.js
'use client';

import Link from "next/link";
//import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full bg-black text-white">
      <div className="flex flex-col items-center py-6">

        {/* Top suit */}
        <div className="text-blue-400 text-xl mb-1">♠</div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold tracking-wide flex items-center gap-2">
          <span className="text-red-500">♦</span>
          <span className="font-[Cinzel]">solitaire</span>
          <span className="text-red-500">♥</span>
        </h1>

        {/* Bottom suit */}
        <div className="text-blue-400 text-xl mt-1">♣</div>

      </div>
    </header>
  );
}
