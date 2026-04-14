// src/components/Header.js
'use client';

export default function Header() {
    return (
        <header className="w-full bg-black text-white">
            <div className="flex flex-col items-center py-2">

                {/* Top suit */}
                <div className="text-blue-400 text-1xl md:text-2xl leading-none">♠</div>
                {/* Title */}
                <h1 className="text-2xl md:text-3xl font-bold tracking-wide flex items-center gap-2">
                    <span className="text-red-500 text-1xl md:text-2xl">♦</span>
                    <span className="font-[UnifrakturCook]">solitaire</span>
                    <span className="text-red-500 text-1xl md:text-2xl">♥</span>
                </h1>
                {/* Bottom suit */}
                <div className="text-blue-400 text-1xl md:text-2xl leading-none">♣</div>

            </div>
        </header>
    );
}
