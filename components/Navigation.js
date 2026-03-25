// components/Navigation.js
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Helper to check if a token exists
  const checkToken = () => setIsLoggedIn(!!localStorage.getItem('token'));

  useEffect(() => {
    checkToken(); // run on mount

    // Listen for token changes in other tabs/windows
    const handleStorage = () => checkToken();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false); // update nav immediately
    router.push('/'); // navigate without reload
  };

  // Define nav links
  const links = [
    { href: '/', label: 'Solitaire' },
    { href: '/profile', label: 'Profile' },
  ];

  // Add auth links dynamically
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
                <Link
                  href={href}
                  onClick={onClick} // works for Logout
                  className={`
                    px-4 py-1 text-sm border rounded-sm transition inline-block
                    ${isActive
                      ? 'border-red-500 text-red-500'
                      : 'border-yellow-500 text-white hover:text-yellow-400'}
                  `}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}