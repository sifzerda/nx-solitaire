// about

"use client";

export default function About() {
  return (
    <div className="flex-1 flex-col bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white font-sans relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-30 -left-30 w-90 h-80 bg-cyan-500/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-30 -right-30 w-90 h-90 bg-fuchsia-500/10 blur-3xl rounded-full" />
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col flex-1 items-center justify-center px-6 py-6">

        {/* Header */}
        <div className="text-center max-w-2xl mb-12">
          <h1 className="text-3xl md:text-4xl font-[UnifrakturCook] mb-6 tracking-tight">About</h1>

          <p className="text-zinc-600 dark:text-zinc-300 text-lg leading-relaxed">This is a refactor of my previous [inactive] solitaire game.</p>
        </div>

        {/* Main content panel */}
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-10 items-center">

          {/* Left info panel */}
         <div className="max-w-md mx-auto w-full md:max-w-none border border-zinc-200 dark:border-zinc-800 bg-linear-to-br from-red-900/30 via-purple-900/30 to-blue-900/30 p-8">
            <h2 className="text-2xl font-bold mb-4 text-red-500/80">Original Ver 1.0</h2>

            <ul className="space-y-3 text-md text-zinc-300">
              <li>&gt;  Fullstack</li>
              <li>&gt;  React</li>
              <li>&gt;  Express</li>
              <li>&gt;  Custom CSS</li>
              <li>&gt;  MongoDB</li>
              <li>&gt;  GraphQL</li>
              <li>&gt;  JWT Auth</li>
              <li>&gt;  Heroku</li>
            </ul>

            <div className="mt-6 h-0.5 w-full bg-linear-to-r from-red-900 via-red-400 to-red-900" />
          </div>

          {/* Right panel */}
          <div className="max-w-md mx-auto w-full md:max-w-none border border-zinc-200 dark:border-zinc-800 bg-linear-to-br from-red-900/30 via-purple-900/30 to-blue-900/30 p-8">
            <h2 className="text-2xl md:text-2xl font-bold mb-4 text-blue-500/80">Current Ver 2.0</h2>

            <ul className="space-y-3 text-md text-zinc-300">
              <li>&gt;  Frontend SPA Router</li>
              <li>&gt;  Next.js</li>
              <li>&gt;  Zustand</li>
              <li>&gt;  Tailwind</li>
              <li>&gt;  Custom Auth</li>
              <li>&gt;  Rust</li>
              <li>&gt;  Tauri</li>
              <li>&gt;  Vercel</li>
            </ul>

            <div className="mt-6 h-0.5 w-full bg-linear-to-r from-indigo-900 via-blue-600 to-indigo-900" />
          </div>

        </div>
      </div>
    </div>
  );
}