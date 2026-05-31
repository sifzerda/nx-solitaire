// src/components/Header.js
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export default function Header() {
    const pathname = usePathname();
    const menuRef = useRef(null);
    const buttonRef = useRef(null);
    const [open, setOpen] = useState(false);

    // detect Tauri desktop app
    const isDesktop = typeof window !== "undefined" && window.__TAURI__;

    const baseLinks = [
        { label: "Play", href: "/" },
        { label: "About", href: "/about" },
    ];

    const links = isDesktop
        ? baseLinks
        : [
            ...baseLinks,
            { label: "Download", href: "/Solitaire.exe", download: true },
        ];

    useEffect(() => {
        function handleClickOutside(e) {
            const clickedMenu = menuRef.current?.contains(e.target);
            const clickedButton = buttonRef.current?.contains(e.target);
            if (!clickedMenu && !clickedButton) setOpen(false);
        }

        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    return (
        <header className="relative border-b-2 border-yellow-500 px-4 py-2">
            <div className="flex items-center justify-between">

                {/* TITLE */}
                <h1 className="text-2xl md:text-4xl font-bold tracking-wide font-[UnifrakturCook] truncate">solitaire</h1>

                <button ref={buttonRef} onClick={() => setOpen((prev) => !prev)}
                    className="md:hidden min-w-18 text-center font-mono border border-yellow-500 px-3 py-2 text-xs uppercase tracking-[0.25em] hover:text-yellow-400">
                    {open ? "Close" : "Menu"}
                </button>

                {/* DESKTOP NAV */}
                <div className="hidden md:flex items-center gap-3">
                    {links.map((item) =>
                        item.download ? (
                            <a key={item.label} href={item.href} download className={`
        border border-green-400/40 bg-green-500/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.25em]
        text-white transition-all duration-200 hover:text-green-400 hover:border-green-400
      `}>
                                {item.label}
                            </a>
                        ) : (
                            <Link key={item.label} href={item.href} className={`
        border px-4 py-2 font-mono text-xs uppercase tracking-[0.25em] transition-all duration-200
        ${pathname === item.href
                                    ? "border-blue-400/40 text-white hover:text-blue-400 hover:border-blue-400"
                                    : "border-yellow-500/40 text-white hover:text-yellow-400 hover:border-yellow-400"
                                }`}>
                                {item.label}
                            </Link>
                        )
                    )}
                </div>

            </div>

            {/* MOBILE DROPDOWN */}
            <div ref={menuRef}
                className={`md:hidden absolute left-0 top-full z-50 w-full font-mono uppercase tracking-[0.25em] border-b-2 border-yellow-500 bg-black transition-all duration-200 ease-out
                    ${open
                        ? "opacity-100 translate-y-0"
                        : "pointer-events-none opacity-0 -translate-y-2"
                    }`}>
                <div className="flex flex-col gap-2 p-3">
                    {links.map((item) =>
                        item.download ? (
                            <a key={item.label} href={item.href} download onClick={() => setOpen(false)}
                                className="
        block border px-4 py-3 text-sm font-mono uppercase tracking-[0.25em] transition
        border-green-400/40 bg-green-500/10 text-white
        hover:text-green-400 hover:border-green-400">
                                {item.label}
                            </a>
                        ) : (
                            <Link key={item.label} href={item.href} onClick={() => setOpen(false)}
                                className={`block border px-4 py-3 text-sm transition
        ${pathname === item.href
                                        ? "border-blue-400/40 text-blue-400 hover:border-blue-400"
                                        : "border-yellow-500/40 text-white hover:text-yellow-400 hover:border-yellow-400"
                                    }
      `}
                            >
                                {item.label}
                            </Link>
                        )
                    )}
                </div>
            </div>

        </header>
    );
}


