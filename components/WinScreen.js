// components/WinScreen.js

"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const FIREWORK_COLORS = [
    [0, 100, 60],     // red
    [30, 100, 60],    // orange
    [50, 100, 60],    // gold
    [120, 100, 55],   // green
    [200, 100, 60],   // blue
    [280, 100, 65],   // purple
    [320, 100, 65],   // pink
];

export default function WinScreen({ onRestart }) {
    const router = useRouter();

    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        let mounted = true;

        /* -------------------- RESIZE -------------------- */

        function resize() {
            const dpr = Math.min(
                window.devicePixelRatio || 1,
                1.5
            );

            canvas.width =
                window.innerWidth * dpr;

            canvas.height =
                window.innerHeight * dpr;

            canvas.style.width =
                `${window.innerWidth}px`;

            canvas.style.height =
                `${window.innerHeight}px`;

            ctx.setTransform(
                dpr,
                0,
                0,
                dpr,
                0,
                0
            );
        }

        resize();

        window.addEventListener(
            "resize",
            resize,
            { passive: true }
        );

        /* -------------------- PARTICLES -------------------- */

        const particles = [];

        /* -------------------- SPAWN -------------------- */

        function spawnFirework() {
            const startX =
                Math.random() *
                window.innerWidth;

            const targetX =
                100 +
                Math.random() *
                (window.innerWidth - 200);

            const targetY =
                60 +
                Math.random() *
                (window.innerHeight * 0.45);

            const color =
                FIREWORK_COLORS[
                Math.floor(
                    Math.random() *
                    FIREWORK_COLORS.length
                )
                ];

            particles.push({
                type: "rocket",

                x: startX,
                y: window.innerHeight + 20,

                vx:
                    (targetX - startX) *
                    0.012,

                vy:
                    -11 -
                    Math.random() * 4,

                targetY,

                color,

                trail: [],

                exploded: false,
            });
        }

        /* -------------------- EXPLOSION -------------------- */

        function explode(x, y, color) {
            const count =
                90 + Math.random() * 70;

            const pattern =
                Math.floor(
                    Math.random() * 4
                );

            for (let i = 0; i < count; i++) {
                let angle;
                let speed;

                /* ROUND BURST */

                if (pattern === 0) {
                    angle =
                        Math.random() *
                        Math.PI *
                        2;

                    speed =
                        2 +
                        Math.random() * 6;
                }

                /* RING */

                else if (pattern === 1) {
                    angle =
                        (Math.PI * 2 * i) /
                        count;

                    speed =
                        4 +
                        Math.random() * 1.5;
                }

                /* CHRYSANTHEMUM */

                else if (pattern === 2) {
                    angle =
                        (Math.PI * 2 * i) /
                        count +
                        (Math.random() - 0.5) *
                        0.2;

                    speed =
                        2 +
                        Math.random() * 8;
                }

                /* PALM */

                else {
                    angle =
                        -Math.PI / 2 +
                        (Math.random() - 0.5) *
                        1.2;

                    speed =
                        3 +
                        Math.random() * 7;
                }

                particles.push({
                    type: "spark",

                    x,
                    y,

                    vx:
                        Math.cos(angle) *
                        speed,

                    vy:
                        Math.sin(angle) *
                        speed,

                    hue:
                        color[0] +
                        (Math.random() * 30 - 15),

                    life:
                        70 +
                        Math.random() * 50,

                    age: 0,

                    size:
                        1.5 +
                        Math.random() * 3,

                    crackle:
                        Math.random() > 0.82,

                    gravity:
                        0.035 +
                        Math.random() * 0.03,
                });
            }

            /* SECONDARY BURSTS */

            if (Math.random() > 0.5) {
                setTimeout(() => {
                    for (let i = 0; i < 25; i++) {
                        const angle =
                            Math.random() *
                            Math.PI *
                            2;

                        const speed =
                            1 +
                            Math.random() * 4;

                        particles.push({
                            type: "spark",

                            x,
                            y,

                            vx:
                                Math.cos(angle) *
                                speed,

                            vy:
                                Math.sin(angle) *
                                speed,

                            hue:
                                color[0] +
                                (Math.random() * 80 - 40),

                            life:
                                45 +
                                Math.random() * 25,

                            age: 0,

                            size:
                                1 +
                                Math.random() * 2,

                            gravity: 0.04,
                        });
                    }
                }, 120);
            }
        }

        /* -------------------- ANIMATION -------------------- */

        let lastSpawn = 0;

        function animate(timestamp = 0) {
            if (!mounted) return;

            animationRef.current =
                requestAnimationFrame(animate);

            if (document.hidden) return;

            /* VERY LIGHT TRAIL FADE */

            // soft fade instead of full clear
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            /* RANDOM FIRE RATE */

            if (
                timestamp - lastSpawn >
                220 + Math.random() * 400
            ) {
                spawnFirework();

                lastSpawn = timestamp;
            }

            for (const p of particles) {
                if (p.dead) continue;

                /* ---------------- ROCKET ---------------- */

                if (p.type === "rocket") {
                    p.trail.push({
                        x: p.x,
                        y: p.y,
                    });

                    if (p.trail.length > 8) {
                        p.trail.shift();
                    }

                    p.x += p.vx;
                    p.y += p.vy;

                    p.vy += 0.018;

                    /* TRAIL */

                    for (
                        let i = 0;
                        i < p.trail.length;
                        i++
                    ) {
                        const t = p.trail[i];

                        const alpha =
                            i / p.trail.length;

                        ctx.beginPath();

                        ctx.arc(
                            t.x,
                            t.y,
                            2,
                            0,
                            Math.PI * 2
                        );

                        ctx.fillStyle =
                            `hsla(${p.color[0]},100%,70%,${alpha})`;

                        ctx.fill();
                    }

                    /* MAIN GLOW */

                    ctx.beginPath();

                    ctx.arc(
                        p.x,
                        p.y,
                        5,
                        0,
                        Math.PI * 2
                    );

                    ctx.shadowBlur = 24;

                    ctx.shadowColor =
                        `hsl(${p.color[0]},100%,60%)`;

                    ctx.fillStyle =
                        `hsl(${p.color[0]},100%,65%)`;

                    ctx.fill();

                    /* WHITE CORE */

                    ctx.beginPath();

                    ctx.arc(
                        p.x,
                        p.y,
                        2,
                        0,
                        Math.PI * 2
                    );

                    ctx.fillStyle = "white";

                    ctx.fill();

                    ctx.shadowBlur = 0;

                    /* EXPLODE */

                    if (
                        p.y <= p.targetY &&
                        !p.exploded
                    ) {
                        p.exploded = true;
                        p.dead = true;

                        explode(
                            p.x,
                            p.y,
                            p.color
                        );
                    }
                }

                /* ---------------- SPARK ---------------- */

                else if (p.type === "spark") {
                    p.x += p.vx;
                    p.y += p.vy;

                    p.vy += p.gravity;

                    p.vx *= 0.992;

                    p.age++;

                    /* CRACKLE */

                    if (
                        p.crackle &&
                        Math.random() > 0.92
                    ) {
                        p.vx *= -0.3;
                        p.vy *= 0.5;
                    }

                    const alpha =
                        1 - p.age / p.life;

                    if (alpha <= 0) {
                        p.dead = true;
                        continue;
                    }

                    /* TINY TRAIL */

                    ctx.beginPath();

                    ctx.moveTo(
                        p.x,
                        p.y
                    );

                    ctx.lineTo(
                        p.x - p.vx * 2,
                        p.y - p.vy * 2
                    );

                    ctx.strokeStyle =
                        `hsla(${p.hue},100%,70%,${alpha * 0.7})`;

                    ctx.lineWidth = 1;

                    ctx.stroke();

                    /* SPARK */

                    ctx.beginPath();

                    ctx.arc(
                        p.x,
                        p.y,
                        p.size,
                        0,
                        Math.PI * 2
                    );

                    const lightness =
                        55 +
                        Math.sin(
                            p.age * 0.15
                        ) * 10;

                    ctx.shadowBlur = 12;

                    ctx.shadowColor =
                        `hsla(${p.hue},100%,60%,${alpha})`;

                    ctx.fillStyle =
                        `hsla(${p.hue},100%,${lightness}%,${alpha})`;

                    ctx.fill();

                    ctx.shadowBlur = 0;
                }
            }

            /* PARTICLE CAP */

            if (particles.length > 1400) {
                particles.splice(
                    0,
                    particles.length - 1400
                );
            }
        }

        animate();

        /* -------------------- CLEANUP -------------------- */

        return () => {
            mounted = false;

            cancelAnimationFrame(
                animationRef.current
            );

            window.removeEventListener(
                "resize",
                resize
            );
        };
    }, []);

    return (
        <>
            <canvas
                ref={canvasRef}
                className="
                    fixed
                    inset-0
                    z-50
                    pointer-events-none
                "
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
                    z-[60]

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