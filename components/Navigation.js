"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isLoggedIn = status === "authenticated";

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const links = [{ href: "/", label: "Solitaire" }];

  if (isLoggedIn) {
    links.push({ href: "/profile", label: "Profile" });
    links.push({ label: "Logout", action: handleLogout });
  } else {
    links.push(
      { href: "/signup", label: "Signup" },
      { href: "/login", label: "Login" }
    );
  }

  return (
    <nav className="w-full bg-black text-white">
      <div className="h-[2px] bg-yellow-500 w-full" />
      <div className="flex justify-center py-3">
        <ul className="flex gap-3">
          {links.map((link) => {
            const isActive = link.href === pathname;

            return (
              <li key={link.label}>
                {link.action ? (
                  <button
                    onClick={link.action}
                    type="button"
                    className="px-4 py-1 text-sm border rounded-sm transition inline-block border-yellow-500 text-white hover:text-yellow-400"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    className={`
                      px-4 py-1 text-sm border rounded-sm transition inline-block
                      ${
                        isActive
                          ? "border-red-500 text-red-500"
                          : "border-yellow-500 text-white hover:text-yellow-400"
                      }
                    `}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}