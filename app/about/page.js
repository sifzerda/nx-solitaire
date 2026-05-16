// about

"use client";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white font-sans relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-120px] left-[-120px] w-[320px] h-[320px] bg-cyan-500/10 blur-3xl rounded-full" />
        <div className="absolute bottom-[-120px] right-[-120px] w-[360px] h-[360px] bg-fuchsia-500/10 blur-3xl rounded-full" />
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col flex-1 items-center justify-center px-6 py-20">

        {/* Header */}
        <div className="text-center max-w-2xl mb-12">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            About
          </h1>

          <p className="text-zinc-600 dark:text-zinc-300 text-lg leading-relaxed">
            This is an interactive, game-inspired experience built with modern UI patterns,
            smooth motion systems, and a focus on tactile user interaction.
          </p>
        </div>

        {/* Main content panel */}
        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-10 items-center">

          {/* Left info panel */}
          <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">What this is</h2>

            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
              A sandbox-style interface designed to feel responsive and engaging,
              combining game-like mechanics with clean UI structure.
            </p>

            <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <li>• Smooth interactive components</li>
              <li>• Dark sci-fi inspired UI design</li>
              <li>• Modular reusable architecture</li>
              <li>• Built for experimentation and expansion</li>
            </ul>

            <div className="mt-6 h-1 w-24 bg-gradient-to-r from-blue-400 to-red-400 rounded-full" />
          </div>

          {/* Right: your game component */}
          <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-6 shadow-2xl flex items-center justify-center min-h-[320px]">
 
          </div>

        </div>
      </div>
    </div>
  );
}