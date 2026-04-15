'use client';

import { FaGithub } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="w-full bg-black text-white">
            <div className="flex flex-col items-center mb-2">

                {/* Top gold line */}
                <div className="w-full h-[2px] bg-yellow-500 mb-2"></div>

                {/* Suits row */}
                <div className="flex items-center gap-3 text-lg mb-1">
                    <span className="text-blue-400">♠</span>
                    <span className="text-red-500">♥</span>
                    <span className="text-blue-400">♣</span>
                    <span className="text-red-500">♦</span>
                </div>

                {/* GitHub icon (simple inline SVG to avoid deps) */}
                <a
                    href="https://github.com/sifzerda/nx-solitaire"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-2 text-white hover:text-blue-400 transition"
                >
                    <FaGithub className="w-6 h-6" />
                </a>

                {/* Year */}
                <p className="text-sm text-white">sifzerda 2026</p>

                {/* Bottom blue line */}
            </div>
        </footer>
    );
}