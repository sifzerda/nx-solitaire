// app/signup.js

'use client';

export default function Signup() {
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
            <span className="font-[var(--font-cinzel)]">Sign Up</span>
            <span className="text-red-500">♥</span>
          </h1>

          {/* Form */}
          <form className="w-full flex flex-col gap-4">

            <input
              type="text"
              placeholder="Username"
              className="w-full px-4 py-2 bg-transparent border border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:outline-none focus:border-blue-500"
            />

            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 bg-transparent border border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:outline-none focus:border-blue-500"
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 bg-transparent border border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:outline-none focus:border-blue-500"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full px-4 py-2 bg-transparent border border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:outline-none focus:border-blue-500"
            />

            <button
              type="submit"
              className="mt-4 w-full py-2 bg-black text-white border border-zinc-700 hover:bg-zinc-900 transition"
            >
              Create Account
            </button>
          </form>

          {/* Suits divider */}
          <div className="flex items-center gap-3 text-lg my-6">
            <span className="text-blue-400">♠</span>
            <span className="text-red-500">♥</span>
            <span className="text-blue-400">♣</span>
            <span className="text-red-500">♦</span>
          </div>

          {/* Bottom text */}
          <p className="text-sm text-zinc-500">
            Already have an account?{" "}
            <a href="/login" className="text-white hover:underline">
              Sign in
            </a>
          </p>

          {/* Bottom blue line */}
          <div className="w-full h-[2px] bg-gradient-to-r from-blue-900 via-blue-600 to-blue-900 mt-6" />

        </div>

      </main>
    </div>
  );
}