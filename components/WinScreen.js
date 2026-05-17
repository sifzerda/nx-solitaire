// components/WinScreen.js

"use client";

import { memo, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Fireworks } from "@fireworks-js/react";

// Keep object references stable
const FIREWORKS_OPTIONS = Object.freeze({
    autoresize: true,
    // Lower opacity reduces overdraw cost
    opacity: 0.06,
    // Physics
    acceleration: 1.02,
    friction: 0.98,
    gravity: 1.2,
    // fewer particles + lower intensity
    particles: 45,
    intensity: 18,
    // Reduce extra rendering work
    traceLength: 2,
    traceSpeed: 8,
    explosion: 4,
    flickering: 20,
    lineStyle: "round",
    hue: { min: 0, max: 360 },
    // Fewer launches
    delay: { min: 40, max: 80 },
    rocketsPoint: { min: 20, max: 80 },
    lineWidth: {
        explosion: { min: 1, max: 2 },
        trace: { min: 0.5, max: 1 },
    },
    brightness: { min: 50, max: 70 },
    // Faster cleanup
    decay: { min: 0.02, max: 0.035 },
    // Disable interaction listeners
    mouse: { click: false, move: false, max: 0 },
});

function WinScreen({ onRestart }) {
    const router = useRouter();
    // Stable callback prevents button rerenders downstream
    const handleRestart = useCallback(() => {
        onRestart?.();
        router.push("/");
    }, [onRestart, router]);
    // Stable style object if you later add props
    const fireworksOptions = useMemo(() => FIREWORKS_OPTIONS, []);

    return (
        <>
            <Fireworks className="fixed inset-0 z-50 pointer-events-none" options={fireworksOptions} />

            <button onClick={handleRestart} className="
                    fixed bottom-5 right-5 z-60
                    px-5 py-3 rounded-xl
                    bg-white/90 text-black font-semibold
                    shadow-xl backdrop-blur-sm
                    transition-transform
                    hover:scale-105 active:scale-95
                    will-change-transform
                ">
                New Game
            </button>
        </>
    );
}

export default memo(WinScreen);