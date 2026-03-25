// app/profile.js

'use client';

export default function Profile() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black">

      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-24 px-16 bg-white dark:bg-black">

        {/* Card */}
        <div className="w-full max-w-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-8 flex flex-col items-center">

          {/* Top gold line */}
          <div className="w-full h-[2px] bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 mb-6" />

          {/* Title */}
          <h1 className="text-3xl tracking-wide mb-6 text-black dark:text-white flex items-center gap-2">
            <span className="text-red-500">♦</span>
            <span className="font-[var(--font-cinzel)]">Profile</span>
            <span className="text-red-500">♥</span>
          </h1>

          {/* Avatar */}
          <div className="w-24 h-24 rounded-full border border-zinc-300 dark:border-zinc-700 mb-4 flex items-center justify-center text-3xl text-zinc-400">
            ?
          </div>

          {/* User info */}
          <div className="w-full flex flex-col gap-3 text-center mb-6">
            <p className="text-lg text-black dark:text-white">Username</p>
            <p className="text-sm text-zinc-500">user@email.com</p>
          </div>

          {/* Actions */}
          <div className="w-full flex flex-col gap-3">

            <button className="w-full py-2 border border-zinc-700 text-white bg-black hover:bg-zinc-900 transition">
              Edit Profile
            </button>

            <button className="w-full py-2 border border-red-800 text-red-500 hover:bg-red-900/20 transition">
              Log Out
            </button>

          </div>

          {/* Divider suits */}
          <div className="flex items-center gap-3 text-lg my-6">
            <span className="text-blue-400">♠</span>
            <span className="text-red-500">♥</span>
            <span className="text-blue-400">♣</span>
            <span className="text-red-500">♦</span>
          </div>

          {/* Bottom label */}
          <p className="text-xs text-zinc-500 tracking-wide">
            Account Overview
          </p>

          {/* Bottom blue line */}
          <div className="w-full h-[2px] bg-gradient-to-r from-blue-900 via-blue-600 to-blue-900 mt-6" />

        </div>

      </main>
    </div>
  );
}