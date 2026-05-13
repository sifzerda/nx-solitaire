// components/WinScreen.js

"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Fireworks } from "@fireworks-js/react";

export default function WinScreen({ onRestart }) {
    const router = useRouter();
    const fireworksRef = useRef(null);

    return (
        <>
            <Fireworks
                ref={fireworksRef}
                className="fixed inset-0 z-50 pointer-events-none"
                options={{
                    autoresize: true,

                    opacity: 0.5,
                    acceleration: 1.05,
                    friction: 0.97,
                    gravity: 1.5,

                    particles: 90,

                    traceLength: 3,
                    traceSpeed: 10,

                    explosion: 5,
                    intensity: 30,
                    flickering: 50,

                    lineStyle: "round",

                    hue: {
                        min: 0,
                        max: 360,
                    },

                    delay: {
                        min: 15,
                        max: 30,
                    },

                    rocketsPoint: {
                        min: 10,
                        max: 90,
                    },

                    lineWidth: {
                        explosion: {
                            min: 1,
                            max: 3,
                        },

                        trace: {
                            min: 0.1,
                            max: 1,
                        },
                    },

                    brightness: {
                        min: 50,
                        max: 80,
                    },

                    decay: {
                        min: 0.015,
                        max: 0.03,
                    },

                    mouse: {
                        click: false,
                        move: false,
                        max: 1,
                    },
                }}
                style={{
                    position: "fixed",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 50,
                    pointerEvents: "none",
                }}
            />

            <button
                onClick={() => {
                    onRestart?.();
                    router.push("/");
                }}
                className="
                    fixed
                    bottom-5
                    right-5
                    z-60
                    px-5
                    py-3
                    rounded-xl
                    bg-white/90
                    text-black
                    font-semibold
                    shadow-xl
                    backdrop-blur-sm
                    hover:scale-105
                    active:scale-95
                    transition
                "
            >
                New Game
            </button>
        </>
    );
}