// components/WinScreen.js

"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const CARD_WIDTH = 80;
const CARD_HEIGHT = 112;
const GRAVITY = 0.33;

const KING_IMAGES = [
    "/cards/KS.svg",
    "/cards/KH.svg",
    "/cards/KD.svg",
    "/cards/KC.svg",
];

export default function WinScreen({ bgClass, onRestart }) {
    const router = useRouter();
    
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const imagesRef = useRef({});
    const cardsRef = useRef([]);
    const clearCounterRef = useRef(0);

    /* -------------------- GET FOUNDATION POSITIONS -------------------- */

    function getFoundationPositions() {
        const nodes = document.querySelectorAll( "[data-foundation]" );

        return Array.from(nodes).map((el) => {
            const rect = el.getBoundingClientRect();

            return { x: rect.left + rect.width / 2,
                     y: rect.top + rect.height / 2,
            };
        });
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let mounted = true;

        /* -------------------- RESIZE -------------------- */

        function resize() {
            const dpr = Math.min( window.devicePixelRatio || 1, 1.5 );

            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;

            ctx.setTransform( dpr, 0, 0, dpr, 0, 0 );
        }

        resize();

        window.addEventListener( "resize", resize, { passive: true } );

        /* -------------------- LOAD IMAGES -------------------- */

        KING_IMAGES.forEach((src) => {
            const img = new Image();
            img.src = src;
            imagesRef.current[src] = img;
        });

        /* -------------------- INIT -------------------- */

        const timeout = setTimeout(() => {
            if (!mounted) return;
            const origins = getFoundationPositions();

            /* -------------------- CREATE 4 ACTIVE CARDS -------------------- */

            const cards = origins.map(
                (origin, i) => {
                    const laneAngles = [ -1.38, -1.18, -0.98, -0.78 ];
                    const angle = laneAngles[i] || -1.1;
                    const speed = 21;

                    return {
                        suitIndex: i,

                        x: origin.x,
                        y: origin.y,

                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        rotation: Math.random() * Math.PI * 2,
                        vr: (Math.random() - 0.5) * 0.015,
                    };
                }
            );

            cardsRef.current = cards;

            /* -------------------- ANIMATION -------------------- */

            function animate() {
                if (!mounted) return;
                animationRef.current = requestAnimationFrame( animate );
                if (document.hidden)
                    return;
                const width = window.innerWidth;
                const height = window.innerHeight;

                /* -------------------- FADE PREVIOUS FRAMES -------------------- */

                ctx.fillStyle = "rgba(0, 80, 0, 0.035)";
                ctx.fillRect( 0, 0, canvas.width, canvas.height );

                /* -------------------- OCCASIONAL HARD CLEAR -------------------- */

                clearCounterRef.current++;
                if ( clearCounterRef.current > 1400 ) {
                    ctx.clearRect( 0, 0, canvas.width, canvas.height );
                    clearCounterRef.current = 0;
                }

                /* -------------------- UPDATE/DRAW -------------------- */

                for (const card of cardsRef.current) {
                    /* physics */
                    card.vy += GRAVITY;
                    card.x += card.vx;
                    card.y += card.vy;
                    card.rotation += card.vr;

                    /* side bounce */
                    if (
                        card.x < CARD_WIDTH / 2
                    ) {
                        card.x = CARD_WIDTH / 2; card.vx *= -1;
                    }

                    if (
                        card.x > width - CARD_WIDTH / 2
                    ) {
                        card.x = width - CARD_WIDTH / 2; card.vx *= -1;
                    }

                    /* bottom bounce */
                    if (
                        card.y > height - CARD_HEIGHT / 2
                    ) {
                        card.y = height - CARD_HEIGHT / 2;
                        card.vy *= -0.92;
                    }

                    /* top safety */
                    if (
                        card.y < -CARD_HEIGHT
                    ) {
                        card.y = -CARD_HEIGHT;
                    }

                    /* draw */
                    const img = imagesRef.current[KING_IMAGES[card.suitIndex]];

                    if (img?.complete) {
                        ctx.save();
                        ctx.translate( card.x, card.y );
                        ctx.rotate( card.rotation );
                        ctx.drawImage( img, -CARD_WIDTH / 2, -CARD_HEIGHT / 2, CARD_WIDTH, CARD_HEIGHT );
                        ctx.restore();
                    }
                }
            }
            animate();
        }, 50);

        /* -------------------- CLEANUP -------------------- */

        return () => {
            mounted = false;
            clearTimeout(timeout);
            cancelAnimationFrame( animationRef.current );
            window.removeEventListener( "resize", resize );
        };
    }, []);

    return (
        <div className={`fixed inset-0 z-50 ${bgClass}`}>
            <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" />

            {/* WIN UI */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-8 flex flex-col items-center gap-5">
                    <h1 className="text-white text-4xl font-bold">You Win!</h1>

                    <button
                        onClick={() => {
                            onRestart?.();
                            router.push("/");
                        }}
                        className="
                            px-6 py-3
                            rounded-xl
                            bg-white
                            text-black
                            font-semibold
                            shadow-lg
                            hover:scale-105
                            active:scale-95
                            transition
                        ">
                        Play Again
                    </button>
                </div>
            </div>
        </div>
    );
}