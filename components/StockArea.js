// components/StockArea.js

"use client";

import { memo } from "react";
import useGameStore from "../store/useGameStore";
import Card from "./Card";
import { CARD_CLASS } from "./cardSizing";

const WASTE_SOURCE = { type: "waste", column: -1 };

const StockArea = memo(function StockArea() {
  const top = useGameStore(state => state.stock[state.stockIndex]);
  const hasStock = useGameStore(state => state.stock.length > 0);
  const isAtEnd = useGameStore(state => state.stockIndex === 0);
  const isDragging = useGameStore(state => !!state.stock[state.stockIndex] && state.draggingIds.includes(state.stock[state.stockIndex].id));
  const isHintWaste = useGameStore(state => state.hint?.from?.type === "waste" && !!state.stock[state.stockIndex] && state.hint.from.cardId === state.stock[state.stockIndex].id);
  const nextStockCard = useGameStore(state => state.nextStockCard);
  const resetStockCycle = useGameStore(state => state.resetStockCycle);

  return (
    <div className="flex w-fit sm:gap-3 md:gap-4 items-center">
      <button type="button" onClick={nextStockCard} aria-label="Next stock card"
        className={`relative ${CARD_CLASS} border-2 border-dashed bg-green-500 border-green-600 rounded-xs cursor-pointer overflow-hidden flex items-center justify-center touch-none focus-visible:outline-2 focus-visible:outline-white`}
        style={{ contain: "layout paint size" }}>
        {hasStock && <div className="w-full h-full rounded-xs bg-[url('/cards/FDC.png')] bg-cover bg-center" />}
      </button>

      <div data-dropzone="waste" className={`relative ${CARD_CLASS} rounded-xs cursor-pointer ${isHintWaste ? "ring-4 ring-green-400 shadow-[0_0_18px_rgba(34,197,94,0.7)] z-10" : ""}`}>
        {top && !isDragging ? <Card card={top} source={WASTE_SOURCE} /> : <div className="w-full h-full border-2 border-dashed border-white/40 rounded-xs" />}
      </div>

      <div className={`${CARD_CLASS} flex items-center justify-center`}>
        {isAtEnd && (
          <button type="button" aria-label="Reset stock cycle" onClick={resetStockCycle}
            className="group relative z-100 flex rounded-xs leading-none border border-green-400/70 px-2 py-2 sm:px-3 sm:py-3 sm:text-3xl shadow-[0_4px_5px_rgba(0,0,0,0.45)] bg-green-500/10 font-mono text-2xl hover:bg-blue-500/30 hover:text-white active:bg-green-400/50 active:scale-95 active:translate-y-0.5 active:shadow-none transition-colors duration-100 cursor-pointer touch-none select-none">↺</button>
        )}
      </div>
    </div>
  );
});

export default StockArea;
