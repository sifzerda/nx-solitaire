// components/WinScreen.js

"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Fireworks } from "@fireworks-js/react";
import { Trophy } from "lucide-react";

function WinScreen({ onRestart }) {
  const [animate, setAnimate] = useState(false);
  const restart = useRef(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAnimate(!query.matches);
    update();
    query.addEventListener("change", update);
    const previous = document.activeElement;
    restart.current?.focus({ preventScroll: true });
    return () => {
      query.removeEventListener("change", update);
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);

  return (
    <>
      {animate && <Fireworks className="fixed inset-0 z-40 pointer-events-none" />}
      <div className="fixed inset-0 z-50 flex items-center md:items-center justify-center p-6 -translate-y-50 md:translate-y-0">
        <div role="dialog" aria-modal="true" aria-labelledby="solitaire-win-title"
          onKeyDown={event => { if (event.key === "Tab") { event.preventDefault(); restart.current?.focus(); } }}
          className="relative overflow-hidden rounded-xs border-2 border-black bg-black/45 backdrop-blur-2xl shadow-2xl">
          <div className="relative flex flex-col items-center gap-4 px-4 py-4 text-center">
            <Trophy size={40} className="text-yellow-300 drop-shadow" aria-hidden="true" />
            <h1 id="solitaire-win-title" className="text-3xl tracking-relaxed text-white" style={{ fontFamily: "var(--font-unifraktur), serif" }}>You Won!</h1>
            <button ref={restart} type="button" onClick={onRestart}
              className="group relative overflow-hidden mt-1 inline-flex items-center gap-3 rounded-xs border border-yellow-300 px-3 py-2 text-yellow-300 bg-black/30 shadow-[0_10px_30px_rgba(16,185,129,0.35)] transition-all duration-200 hover:bg-black/80 hover:text-green-500 hover:border-green-500 hover:shadow-[0_14px_40px_rgba(16,185,129,0.5)] active:scale-[0.98] will-change-transform">
              <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative text-lg">New Game</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(WinScreen);
