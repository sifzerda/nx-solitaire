// components/StockArea.js

"use client";

import { memo } from "react";
import useGameStore from "./useGameStore";
import Card from "./Card";
import { CARD_CLASS } from "./cardSizing";

const StockArea = memo(function StockArea({ type }) {
    const stock = useGameStore((s) => s.stock);
    const stockIndex = useGameStore((s) => s.stockIndex);
    const nextStockCard = useGameStore((s) => s.nextStockCard);
    const resetStockCycle = useGameStore((s) => s.resetStockCycle);
    const topStockCard = stock[stockIndex];
    const isAtEnd = stockIndex === 0;
    const hint = useGameStore((s) => s.hint);
    const isHintWaste = hint?.from?.type === "waste" && hint.from.cardId === topStockCard?.id;

    return (
        <div className="flex w-fit gap-2 sm:gap-3 md:gap-4 items-center">

            {/* ---------------- STOCK ---------------- */}
            <div onClick={nextStockCard} className={`relative ${CARD_CLASS} border-2 border-dashed bg-green-500 border-green-600 rounded-xs cursor-pointer overflow-hidden flex items-center justify-center touch-none`}
                style={{ contain: "layout paint size" }}>
                {stock.length > 0 && (
                    <div className="w-full h-full rounded-xs bg-[url('/cards/FDC.png')] bg-cover bg-center" />)}
            </div>

            {/* ---------------- WASTE (FIXED DRAG SOURCE) ---------------- */}
            <div data-dropzone="waste" className={`relative ${CARD_CLASS} rounded-xs
        ${isHintWaste
                        ? "ring-4 ring-green-400 shadow-[0_0_18px_rgba(34,197,94,0.7)] z-10"
                        : ""
                    }`}>
                {topStockCard ? (
                    <Card card={{ ...topStockCard, faceUp: true }} cards={[{ ...topStockCard, faceUp: true }]}
                        /* make waste consistent source */
                        source={{ type: "waste", column: -1 }} />
                ) : (
                    <div className="w-full h-full border-2 border-dashed border-white/40 rounded-xs" />)}
            </div>

            {/* ---------------- RESET ---------------- */}
            <div className={`${CARD_CLASS} flex items-center justify-center`}>
                {isAtEnd && (
                    <button onPointerUp={(e) => { e.preventDefault(); resetStockCycle(); }}
                        className="group relative flex rounded-xs leading-none
              border border-green-400/70 px-2 py-2 ml-2
              sm:ml-0 sm:px-3 sm:py-3 sm:text-3xl
              shadow-[0_4px_5px_rgba(0,0,0,0.45)]
            bg-green-500/10 font-mono text-2xl
            hover:bg-blue-500/30 hover:text-white 
            active:bg-green-400/50 active:scale-95 active:translate-y-0.5 active:shadow-none
              transition-colors duration-100
              cursor-pointer touch-none select-none" style={{ zIndex: 100 }}>
                        ↺
                    </button>
                )}
            </div>
        </div>
    );
});

export default StockArea;

