// components/Solitaire.js

"use client";

import { useEffect, useCallback } from "react";
import useGameStore from "./useGameStore";
import TableauColumn from "./TableauColumn";
import FoundationPile from "./FoundationPile";
import StockArea from "./StockArea";
import WinScreen from "./WinScreen";
import createGame, { createDeck } from "./createGame";

/* -------------------- CONSTANTS -------------------- */
const gameBgClass = "bg-green-600 bg-[url('/paper.png')] bg-contain";
const deckImages = createDeck();
/* -------------------- COMPONENT -------------------- */

export default function Solitaire() {
  const initializeGame = useGameStore((s) => s.initializeGame);
  const foundations = useGameStore((s) => s.foundations);

  const undo = useGameStore((s) => s.undo);
  const showHint = useGameStore((s) => s.showHint);

  const restartGame = useCallback(() => {
    initializeGame(createGame());
  }, [initializeGame]);

  /* preload images */
  useEffect(() => {
    const images = deckImages.map((card) => {
      const img = new Image();
      img.src = card.image;
      return img;
    });

    return () => {
      images.forEach((img) => {
        img.src = "";
      });
    };
  }, []);

  /* init once */
  useEffect(() => {
    initializeGame(createGame());
  }, [initializeGame]);

  const hasWon = foundations.every((pile) => pile.length === 13);

  return (
    <div className="bg-black flex-1">
      <div className="mx-auto w-fit p-1 sm:p-2 md:p-4 bg-[url('/paper.png')] bg-cover border-5 border-ridged border-green-900 flex flex-col select-none touch-none min-h-150 sm:min-h-200 md:min-h-200" style={{ overscrollBehavior: "contain" }}>

        {/* TOP ROW */}
        <div className="w-full px-2 sm:px-4 md:px-6">
          <div className="mx-auto w-fit grid grid-cols-7 gap-x-1 gap-y-4 sm:gap-x-3 sm:gap-y-5 md:gap-x-4 md:gap-y-6">
            {/* ---------- TOP ROW ---------- */}
            <div className="col-start-4 col-span-4 flex justify-end gap-2">
              <button className="
              border border-green-400/70
              bg-green-500/10 
              px-2 py-2 
              shadow-[0_4px_5px_rgba(0,0,0,0.45)]
              font-mono text-xs uppercase 
              tracking-[0.25em]
              cursor-pointer
              hover:bg-blue-500/30
              active:bg-green-400/50
              active:scale-95
              active:translate-y-0.5
              active:shadow-none
              transition-colors duration-100
              "
                onClick={undo}>
                Undo
              </button>

              <button className="
              border border-green-400/70
              bg-green-500/10 
              px-2 py-2 
              shadow-[0_4px_5px_rgba(0,0,0,0.45)]
              font-mono text-xs uppercase 
              tracking-[0.25em]
              cursor-pointer
              hover:bg-blue-500/30
              active:bg-green-400/50
              active:scale-95
              active:translate-y-0.5
              active:shadow-none
              transition-colors duration-100
              "
                onClick={showHint}>
                Hint
              </button>

              <button className="
              border border-green-400/70
              bg-green-500/10 
              px-2 py-2 
              shadow-[0_4px_5px_rgba(0,0,0,0.45)]
              font-mono text-xs uppercase 
              tracking-[0.25em]
              cursor-pointer
              hover:bg-blue-500/30
              active:bg-green-400/50
              active:scale-95
              active:translate-y-0.5
              active:shadow-none
              transition-colors duration-100
              "
                onClick={restartGame}>New Game</button>

            </div>

            {/* Stock/Waste spans first 3 tableau columns */}
            <div className="col-span-3"><StockArea /></div>

            {/* Foundations align to tableau columns 4-7 */}
            {Array.from({ length: 4 }).map((_, i) => (<FoundationPile key={i} index={i} />))}

            {/* ---------- TABLEAU ---------- */}
            {Array.from({ length: 7 }).map((_, i) => (<TableauColumn key={i} index={i} />))}
          </div>
        </div>

        {(hasWon) ? (<WinScreen bgClass={gameBgClass} onRestart={restartGame} />) : null}
      </div>
    </div>
  );
}