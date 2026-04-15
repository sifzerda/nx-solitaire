'use client';

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
                <a href="https://github.com/sifzerda/nx-solitaire"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-2 hover:text-gray-400 transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-6 h-6"
                    >
                        <path d="M12 0C5.37 0 0 5.37 0 12a12 12 0 008.2 11.38c.6.1.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.78-1.34-1.78-1.1-.75.08-.73.08-.73 1.21.09 1.85 1.25 1.85 1.25 1.08 1.85 2.83 1.31 3.52 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.94 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.65.25 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.64-5.48 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57A12 12 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                </a>

                {/* Year */}
                <p className="text-sm text-gray-400">sifzerda 2026</p>

                {/* Bottom blue line */}
            </div>
        </footer>
    );
}