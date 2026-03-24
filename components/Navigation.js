// components/Navigation.js
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
//import Auth from '../utils/auth';

//ADD AUTH I.E. IF LOGGED IN ETC

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  //useEffect(() => {
 //   const token = localStorage.getItem('token');
 //   setIsLoggedIn(!!token);
 // }, []);

 // const handleLogout = () => {
 //   localStorage.removeItem('token');
 //   router.push('/'); // ✅ Next.js navigation (no full reload)
 // };

  const links = [
    { href: '/', label: 'Solitaire' },
    { href: '/profile', label: 'Profile' },
  ];

  if (isLoggedIn) {
    links.push({ href: '#', label: 'Logout', onClick: handleLogout });
  } else {
    links.push(
      { href: '/signup', label: 'Signup' },
      { href: '/login', label: 'Login' }
    );
  }

  return (
    <nav className="w-full bg-black text-white">

      {/* Gold divider */}
      <div className="h-[2px] bg-yellow-500 w-full" />

      {/* Nav buttons */}
      <div className="flex justify-center py-3">
        <ul className="flex gap-3">
          {links.map(({ href, label, onClick }) => {
            const isActive = pathname === href;

            return (
              <li key={label}>
                {onClick ? (
                  <button
                    onClick={onClick}
                    className="px-4 py-1 text-sm border rounded-sm border-yellow-500 text-white hover:text-yellow-400 transition"
                  >
                    {label}
                  </button>
                ) : (
                  <Link
                    href={href}
                    className={`
                      px-4 py-1 text-sm border rounded-sm transition
                      ${
                        isActive
                          ? 'border-red-500 text-red-500'
                          : 'border-yellow-500 text-white hover:text-yellow-400'
                      }
                    `}
                  >
                    {label}
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