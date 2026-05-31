// components/WinScreen.js

"use client";

import { memo, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Fireworks } from "@fireworks-js/react";
import { Trophy } from "lucide-react";

const FIREWORKS_OPTIONS = Object.freeze({
    autoresize: true,
    opacity: 0.06,
    acceleration: 1.02,
    friction: 0.98,
    gravity: 1.2,
    particles: 45,
    intensity: 18,
    traceLength: 2,
    traceSpeed: 8,
    explosion: 4,
    flickering: 20,
    lineStyle: "round",

    hue: { min: 0, max: 360 },
    delay: { min: 40, max: 80 },
    rocketsPoint: { min: 20, max: 80 },
    lineWidth: {
        explosion: { min: 1, max: 2 },
        trace: { min: 0.5, max: 1 },
    },
    brightness: { min: 50, max: 70 },
    decay: { min: 0.02, max: 0.035 },
    mouse: { click: false, move: false, max: 0 },
});

function WinScreen({ onRestart }) {
    const router = useRouter();

    const handleRestart = useCallback(() => {
        onRestart?.();
        router.push("/");
    }, [onRestart, router]);

    const fireworksOptions = useMemo(() => FIREWORKS_OPTIONS, []);

    return (
        <>
            <Fireworks className="fixed inset-0 z-40 pointer-events-none" options={fireworksOptions} />
            {/* Overlay */}

            <div className="fixed inset-0 z-50 flex items-center md:items-center justify-center p-6 -translate-y-50 md:translate-y-0">
                <div className="relative overflow-hidden rounded-md border-2 border-black bg-black/45 backdrop-blur-2xl shadow-2xl">
                    {/* Glow */}
                    <div className="absolute inset-0 bg-transparent pointer-events-none" />

                    {/* Content */}
                    <div className="relative flex flex-col items-center gap-4 px-4 py-4 text-center">

                        {/* Trophy */}
                        <div className="flex items-center justify-center">
                            <Trophy size={40} className="text-yellow-300 drop-shadow" />
                        </div>

                        {/* Text */}
                        <div className="space-y-2">
                            <h1 className="text-3xl font-[UnifrakturCook] tracking-relaxed text-white">You Won!</h1>
                        </div>

                        {/* Button */}
                        <button onClick={handleRestart} className="group relative overflow-hidden mt-1 inline-flex items-center gap-3 rounded-md  border border-yellow-300 px-3 py-2 text-yellow-300 bg-black/30 shadow-[0_10px_30px_rgba(16,185,129,0.35)] transition-all duration-200  hover:bg-black/80 hover:text-green-500 hover:border-green-500 hover:shadow-[0_14px_40px_rgba(16,185,129,0.5)] active:scale-[0.98] will-change-transform">
                            {/* Shine */}
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