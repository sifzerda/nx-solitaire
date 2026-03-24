// src/components/Navigation.js
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

function Navigation() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if JWT token exists in localStorage
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    // redirect after logout
    window.location.href = '/';
  };

  // Base links
  const links = [
    { href: '/', label: 'About' },
    { href: '/contact', label: 'Contact' },
    { href: '/', label: 'Fiction Map' },
  ];

  // Auth links conditional
  if (isLoggedIn) {
    links.push({ href: '#', label: 'Logout', onClick: handleLogout });
  } else {
    links.push(
      { href: '/signup', label: 'Signup' },
      { href: '/login', label: 'Login' }
    );
  }

  return (
    <nav
      role="navigation"
      className="fixed top-12 left-0 w-full h-16 z-30 bg-black text-white px-6 sm:pl-64 border-b-2 border-borderblue"
    >
      <ul className="flex flex-wrap justify-center items-center h-full space-x-0">
        {links.map(({ href, label, onClick }) => (
          <li key={label}>
            {onClick ? (
              // For logout, use a button or <a> with click handler
              <button
                onClick={onClick}
                className="border border-borderblue px-1 py-1 rounded hover:text-minty hover:border-gray-400 transition cursor-pointer bg-transparent text-white"
              >
                {label}
              </button>
            ) : (
              <Link
                href={href}
                className={`border border-borderblue px-1 py-1 rounded hover:text-minty hover:border-gray-400 transition ${pathname === href ? 'underline font-semibold' : ''
                  }`}
              >
                {label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navigation;