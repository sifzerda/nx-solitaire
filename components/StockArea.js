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

    return (
        <div className="flex w-fit gap-1 sm:gap-2 md:gap-3 items-center">

            {/* ---------------- STOCK ---------------- */}
            <div onClick={nextStockCard} className={`relative ${CARD_CLASS} border-2 border-dashed bg-green-500 border-green-600 rounded-xs cursor-pointer overflow-hidden flex items-center justify-center touch-none`}
                style={{ contain: "layout paint size" }}>
                {stock.length > 0 && (
                    <div className="w-full h-full rounded-xs bg-[url('/cards/FDC.png')] bg-cover bg-center" />)}

                {/* ---------------- <div className="absolute bottom-1 right-1 text-white text-[15px]"> {stock.length}/24 </div>  ---------------- */}
            </div>

            {/* ---------------- WASTE (FIXED DRAG SOURCE) ---------------- */}
            <div data-dropzone="waste" className={`relative ${CARD_CLASS} rounded-xs`}
                style={{ contain: "layout paint size" }}>
                {topStockCard ? (
                    <Card card={{ ...topStockCard, faceUp: true }} cards={[{ ...topStockCard, faceUp: true }]}
                        /* make waste consistent source */
                        source={{ type: "waste", column: -1 }} />
                ) : (
                    <div className="w-full h-full border-2 border-dashed border-white/40 rounded-xs" />)}
            </div>

            {/* ---------------- RESET ---------------- */}
            <div className={`${CARD_CLASS} flex items-center justify-center -ml-2 sm:ml-2`}>
                {isAtEnd && (
                    <button onPointerUp={(e) => {
                        e.preventDefault();
                        resetStockCycle();
                    }}
                        className="group relative flex items-center justify-center rounded-xs backdrop-blur-xl border border-amber-400/90 text-amber-200 font-bold shadow-[0_8px_20px_rgba(0,0,0,0.45)] transition-all duration-100 hover:scale-[1.03] hover:border-amber-300/70 hover:text-white active:translate-y-0.75 active:shadow-[0_2px_6px_rgba(0,0,0,0.5)] cursor-pointer touch-none select-none"
                        style={{width: "70%", height: "70%", zIndex: 100, fontSize: "calc(var(--card-width) * 0.45)",}}>
                        {/* Bottom rim */}
                        <div className="absolute inset-x-0 -bottom-1 h-2 rounded-b-xs bg-amber-900/40 transition-all duration-100 group-active:h-0 group-active:bottom-0" />

                        {/* Glass highlight */}
                        <div className="absolute inset-0 rounded-xs bg-linear-to-b from-white/15 via-white/5 to-transparent pointer-events-none" />

                        <span className="relative z-10 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)] transition-transform duration-100 group-active:translate-y-px">
                            ↺
                        </span>
                    </button>
                )}
            </div>

        </div>
    );
});

export default StockArea;

