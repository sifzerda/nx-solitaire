// src/components/Header.js
'use client';

import Link from "next/link";
import { useAuth } from "../lib/authContext";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { isLoggedIn, logout } = useAuth();

    const links = [{ href: "/", label: "Solitaire" }];

    if (isLoggedIn) {
        links.push({ label: "Logout", action: "logout" });
    } else {
        links.push(
            { href: "/signup", label: "Signup" },
            { href: "/login", label: "Login" }
        );
    }

    return (
        <div className="flex md:grid md:grid-cols-3 items-center py-2 px-4">

        {/* LEFT — only exists on md+ to balance the grid */}
        <div className="hidden md:block" />

        {/* TITLE — left on mobile, centered on md+ */}
        <h1 className="text-2xl md:text-4xl md:text-center font-bold tracking-wide font-[UnifrakturCook] whitespace-nowrap">
            solitaire
        </h1>

            {/* NAV — right-aligned in the third column */}
            <div className="ml-auto md:ml-0 flex items-center justify-end gap-3">
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
                                            ? "border-red-500 text-red-500"
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
    );
}