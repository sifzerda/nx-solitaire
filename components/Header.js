// src/components/Header.js
'use client';

import Link from "next/link";
import { useAuth } from "../lib/authContext";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { isLoggedIn, logout } = useAuth();

    const [open, setOpen] = useState(false);

    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    const links = [
        { href: "/", label: "Play" },
        { href: "/about", label: "About" }
    ];

    if (isLoggedIn) {
        links.push({ label: "Logout", action: "logout" });
    } else {
        links.push(
            { href: "/signup", label: "Signup" },
            { href: "/login", label: "Login" }
        );
    }

    useEffect(() => {
        function handleClickOutside(e) {
            const clickedMenu = menuRef.current?.contains(e.target);
            const clickedButton = buttonRef.current?.contains(e.target);

            if (!clickedMenu && !clickedButton) {
                setOpen(false);
            }
        }

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    return (
        <header className="relative border-b-2 border-yellow-500 px-3 sm:px-4 py-3">

            {/* MOBILE HEADER */}
            <div className="flex items-center justify-between md:hidden">

                <h1 className="text-2xl font-bold tracking-wide font-[UnifrakturCook] truncate">
                    solitaire
                </h1>

                <button
                    ref={buttonRef}
                    onClick={() => setOpen((prev) => !prev)}
                    className="border border-yellow-500 px-3 py-2 text-xs uppercase tracking-widest rounded-sm hover:text-yellow-400"
                >
                    {open ? "Close" : "Menu"}
                </button>
            </div>

            {/* MOBILE DROPDOWN */}
            <div
                ref={menuRef}
                className={`
                    md:hidden absolute left-0 top-full z-50 w-full
                    border-b-2 border-yellow-500
                    bg-black
                    transition-all duration-200 ease-out
                    ${open
                        ? "opacity-100 translate-y-0"
                        : "pointer-events-none opacity-0 -translate-y-2"
                    }
                `}
            >
                <div className="flex flex-col gap-2 p-3">
                    {links.map((item) => {
                        const isActive = item.href === pathname;

                        const handleLogout =
                            item.action === "logout"
                                ? () => {
                                    logout();
                                    router.push("/");
                                    setOpen(false);
                                }
                                : null;

                        return (
                            <div key={item.label}>
                                {handleLogout ? (
                                    <button
                                        onClick={handleLogout}
                                        className="w-full border border-yellow-500 px-4 py-3 text-left text-sm rounded-sm hover:text-yellow-400"
                                    >
                                        Logout
                                    </button>
                                ) : (
                                    <Link
                                        href={item.href}
                                        onClick={() => setOpen(false)}
                                        className={`block border px-4 py-3 text-sm rounded-sm transition
                                        ${isActive
                                                ? "border-green-400 text-green-400"
                                                : "border-yellow-500 text-white hover:text-yellow-400"
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* DESKTOP HEADER */}
            <div className="hidden md:grid md:grid-cols-3 items-center">

                {/* LEFT SPACER */}
                <div />

                {/* TITLE */}
                <h1 className="text-4xl text-center font-bold tracking-wide font-[UnifrakturCook]">
                    solitaire
                </h1>

                {/* NAV */}
                <div className="flex items-center justify-end gap-3">
                    {links.map((item) => {
                        const isActive = item.href === pathname;

                        const handleLogout =
                            item.action === "logout"
                                ? () => {
                                    logout();
                                    router.push("/");
                                }
                                : null;

                        return (
                            <div key={item.label}>
                                {handleLogout ? (
                                    <button
                                        onClick={handleLogout}
                                        className="px-3 py-1 text-sm border border-yellow-500 rounded-sm hover:text-yellow-400"
                                    >
                                        Logout
                                    </button>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className={`px-3 py-1 text-sm border rounded-sm transition inline-block
                                        ${isActive
                                                ? "border-green-400 text-green-400"
                                                : "border-yellow-500 text-white hover:text-yellow-400"
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </div>

            </div>
        </header>
    );
}