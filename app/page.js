// importing the component like this disables SSR which was 
// causing a hydration error

"use client";

import dynamic from "next/dynamic";

const Solitaire = dynamic(() => import("../components/Solitaire"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="flex-1 flex-col items-center justify-center font-sans text-white bg-linear-to-br from-zinc-950 via-black to-zinc-900 relative overflow-hidden">

      {/* optional glow layer */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-fuchsia-500/10 blur-3xl rounded-full" />
      </div>

      {/* content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <Solitaire />
      </div>

    </div>
  );
}