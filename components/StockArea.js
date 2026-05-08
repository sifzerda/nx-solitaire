// components/StockArea.js

"use client";

import { memo } from "react";

import useGameStore from "./useGameStore";
import DropZone from "./DropZone";

const CARD_WIDTH = `w-15 sm:w-18 md:w-22 lg:w-28`;
const CARD_HEIGHT = `h-24 sm:h-26 md:h-30 lg:h-40`;

const StockArea = memo(function StockArea() {
    const stock = useGameStore((s) => s.stock);

    const stockIndex = useGameStore(
        (s) => s.stockIndex
    );

    const nextStockCard = useGameStore(
        (s) => s.nextStockCard
    );

    const resetStockCycle = useGameStore(
        (s) => s.resetStockCycle
    );

    const topStockCard = stock[stockIndex];

    const isAtEnd = stockIndex === 0;

    return (
        <div className="flex gap-1 sm:gap-2 md:gap-3 items-center">
            {/* STOCK */}
            <div
                onClick={nextStockCard}
                className={`
          relative
          ${CARD_WIDTH}
          ${CARD_HEIGHT}
          border-2 border-dashed
          bg-green-500
          border-green-600
          rounded-md
          cursor-pointer
          overflow-hidden
          flex items-center justify-center
        `}
            >
                {stock.length > 0 && (
                    <div
                        className="
      w-full h-full
      rounded-md
      bg-[url('/cards/FDC.png')]
      bg-cover
      bg-center
    "
                    />
                )}

                <div className="absolute bottom-1 right-1 text-white text-[15px]">
                    {stock.length}/24
                </div>
            </div>

            {/* WASTE */}
            <DropZone
                cards={topStockCard ? [{ ...topStockCard, faceUp: true }] : []}
                columnIndex={-1}
                onDrop={() => { }}
                canDropCard={() => false}
            />

            {/* RESET */}
            {isAtEnd && (
                <button
                    onClick={resetStockCycle}
                    className="
          px-2 py-1 sm:px-3 sm:py-2
          text-xs sm:text-sm
          bg-yellow-400
          rounded-md
          font-bold
          hover:bg-yellow-300
          transition
        "
                >
                    Reset
                </button>
            )}
        </div>
    );
});

export default StockArea;