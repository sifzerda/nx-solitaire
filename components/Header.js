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

    const links = isDesktop
        ? [{ label: "Play", href: "/" }]
        : [
            { label: "Play", href: "/" },
            { label: "About", href: "/about" },
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

                {/* DESKTOP NAV */}
                <div className="hidden md:flex items-center gap-3">
                    {links.map((item) => (
                        <Link key={item.label} href={item.href} className={`min-w-18 text-center px-3 py-1 text-sm border rounded-sm transition inline-block
                                ${pathname === item.href
                                ? "border-blue-400 text-blue-400"
                                : "border-yellow-500 text-white hover:text-yellow-400"
                            }`}>
                            {item.label}
                        </Link>
                    ))}
                </div>

                {/* ONLY SHOW DOWNLOAD ON WEBSITE */}
                {!isDesktop && (
                    <a href="/Solitaire.exe" download className=
                        "border border-green-400/40 bg-green-500/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.25em] text-zinc-400 transition-all duration-200 hover:text-green-400 hover:border-green-400">
                        Download</a>
                )}

                {/* MOBILE MENU BUTTON */}
                <button ref={buttonRef} onClick={() => setOpen((prev) => !prev)}
                    className="md:hidden min-w-18 text-center border border-yellow-500 px-3 py-2 text-xs uppercase tracking-widest rounded-sm hover:text-yellow-400">
                    {open ? "Close" : "Menu"}
                </button>
            </div>

            {/* MOBILE DROPDOWN */}
            <div ref={menuRef}
                className={`md:hidden absolute left-0 top-full z-50 w-full border-b-2 border-yellow-500 bg-black transition-all duration-200 ease-out
                    ${open
                        ? "opacity-100 translate-y-0"
                        : "pointer-events-none opacity-0 -translate-y-2"
                    }`}>
                <div className="flex flex-col gap-2 p-3">
                    {links.map((item) => (
                        <Link key={item.label} href={item.href} onClick={() => setOpen(false)}
                            className={`block border px-4 py-3 text-sm rounded-sm transition
                                ${pathname === item.href
                                    ? "border-blue-400 text-blue-400"
                                    : "border-yellow-500 text-white hover:text-yellow-400"
                                }`}>
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>

        </header>
    );
}