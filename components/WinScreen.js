// components/WinKingsCanvas.js

"use client";

import { useEffect, useRef } from "react";

const CARD_WIDTH = 80;
const CARD_HEIGHT = 112;

const MAX_CARDS = 24;

const KING_IMAGES = [
    "/cards/KS.svg",
    "/cards/KH.svg",
    "/cards/KD.svg",
    "/cards/KC.svg",
];

export default function WinScreen({ bgClass }) {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    const cardsRef = useRef([]);
    const imagesRef = useRef({});
    const originsRef = useRef([]);

    /* -------------------- GET FOUNDATION POSITIONS -------------------- */
    function getFoundationPositions() {
        const nodes = document.querySelectorAll("[data-foundation]");

        return Array.from(nodes).map((el) => {
            const rect = el.getBoundingClientRect();

            return {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
            };
        });
    }

    /* -------------------- INIT -------------------- */
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        let mounted = true;

        function resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;

            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        resize();
        window.addEventListener("resize", resize);

        /* -------------------- LOAD IMAGES -------------------- */
        KING_IMAGES.forEach((src) => {
            const img = new Image();
            img.src = src;
            imagesRef.current[src] = img;
        });

        /* -------------------- WAIT FOR DOM (FOUNDATIONS) -------------------- */
        setTimeout(() => {
            if (!mounted) return;

            originsRef.current = getFoundationPositions();

            const origins = originsRef.current;

            /* -------------------- CREATE POOL -------------------- */
            const cards = [];
const now = performance.now();
            for (let i = 0; i < MAX_CARDS; i++) {
                const suitIndex = i % 4;
                const origin = origins[suitIndex] || {
                    x: window.innerWidth / 2,
                    y: window.innerHeight / 3,
                };

                const card = {
                    originX: origin.x,
                    originY: origin.y,

                    x: origin.x,
                    y: origin.y,

                    vx: (Math.random() - 0.5) * 14,
                    vy: -10 - Math.random() * 10,

                    rotation: Math.random() * Math.PI * 2,
                    vr: (Math.random() - 0.5) * 0.18,

                    image:
                        imagesRef.current[
                        KING_IMAGES[Math.floor(Math.random() * 4)]
                        ],
                         nextBurst: now + i * 120,

                    active: true,
                };

                cards.push(card);
            }

            cardsRef.current = cards;

            /* -------------------- ANIMATION -------------------- */
            function animate() {
                if (!mounted) return;

                ctx.fillStyle = "rgba(0,0,0,0.00)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                for (const card of cardsRef.current) {
                    /* physics */
                    card.vy += 0.35;

                    card.x += card.vx;
                    card.y += card.vy;

                    card.rotation += card.vr;

                    /* wall bounce */
                    if (card.x < CARD_WIDTH / 2) {
                        card.x = CARD_WIDTH / 2;
                        card.vx *= -1;
                    }

                    if (card.x > window.innerWidth - CARD_WIDTH / 2) {
                        card.x = window.innerWidth - CARD_WIDTH / 2;
                        card.vx *= -1;
                    }

                    /* floor bounce */
                    if (card.y > window.innerHeight - CARD_HEIGHT / 2) {
                        card.y = window.innerHeight - CARD_HEIGHT / 2;
                        card.vy *= -0.82;
                    }

                    /* recycle ONLY when far off screen */
const now = performance.now();

/* 🔥 EMITTER RESTART LOGIC */
if (now >= card.nextBurst) {
  const suitIndex = cardsRef.current.indexOf(card) % 4;

  const origin = card.originX;

  const baseAngle = -0.7 + suitIndex * 0.5;
  const angle = baseAngle + (Math.random() - 0.5) * 0.25;

  const speed = 12 + Math.random() * 3;

  card.x = card.originX;
  card.y = card.originY;

  card.vx = Math.cos(angle) * speed;
  card.vy = Math.sin(angle) * speed - 6;

  card.rotation = Math.random() * Math.PI * 2;
  card.vr = (Math.random() - 0.5) * 0.18;

  card.nextBurst = now + 700 + Math.random() * 900;
}

                    /* draw */
                    const img = card.image;

                    if (img?.complete) {
                        ctx.save();

                        ctx.translate(card.x, card.y);
                        ctx.rotate(card.rotation);

                        ctx.drawImage(
                            img,
                            -CARD_WIDTH / 2,
                            -CARD_HEIGHT / 2,
                            CARD_WIDTH,
                            CARD_HEIGHT
                        );

                        ctx.restore();
                    }
                }

                animationRef.current = requestAnimationFrame(animate);
            }

            animate();
        }, 50);

        /* -------------------- CLEANUP -------------------- */
        return () => {
            mounted = false;

            cancelAnimationFrame(animationRef.current);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <div className={`
      fixed inset-0 z-50
      ${bgClass}
      flex items-center justify-center
    `}>

            <canvas ref={canvasRef} className="fixed inset-0 z-50 pointer-events-none " />
        </div>
    );
}


