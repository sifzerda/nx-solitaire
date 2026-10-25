// components/Solitaire.js

"use client";

import { useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import useGameStore from "../store/useGameStore";
import TableauColumn from "./TableauColumn";
import FoundationPile from "./FoundationPile";
import StockArea from "./StockArea";
import createGame, { createDeck } from "./createGame";
import { disposePointerDrag } from "./usePointerDrag";

// Load the celebration and fireworks package only when needed.
const WinScreen = dynamic(() => import("./WinScreen"), { ssr: false });
const FOUNDATION_INDICES = [0, 1, 2, 3];
const TABLEAU_INDICES = [0, 1, 2, 3, 4, 5, 6];
const BUTTON_CLASS = "border border-green-400/70 bg-green-500/10 px-2 py-2 shadow-[0_4px_5px_rgba(0,0,0,0.45)] font-mono text-xs uppercase tracking-[0.25em] cursor-pointer hover:bg-blue-500/30 active:bg-green-400/50 active:scale-95 active:translate-y-0.5 active:shadow-none transition-colors duration-100 focus-visible:outline-2 focus-visible:outline-white";
let preloaded = false;

function preloadCards() {
  if (preloaded) return;
  preloaded = true;
  for (const source of [...createDeck().map(card => card.image), "/cards/FDC.png"]) {
    const image = new window.Image();
    image.src = source;
  }
}

export default function Solitaire() {
  const initialized = useRef(false);
  const initializeGame = useGameStore(state => state.initializeGame);
  // Subscribe to the boolean rather than rerendering the board on every foundation move.
  const hasWon = useGameStore(state => state.foundations.length === 4 && state.foundations.every(pile => pile.length === 13));
  const undo = useGameStore(state => state.undo);
  const showHint = useGameStore(state => state.showHint);
  const restartGame = useCallback(() => initializeGame(createGame()), [initializeGame]);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      restartGame();
    }
    preloadCards();
    return disposePointerDrag;
  }, [restartGame]);

  return (
    <div className="bg-black flex-1">
      <div className="mx-auto w-fit p-1 sm:p-2 md:p-4 bg-[url('/paper.png')] bg-cover border-5 border-ridged border-green-900 flex flex-col select-none touch-none min-h-150 sm:min-h-200 md:min-h-200" style={{ overscrollBehavior: "contain" }}>
        <div className="w-full px-2 sm:px-4 md:px-6">
          <div className="mx-auto w-fit grid grid-cols-7 gap-x-1 gap-y-4 sm:gap-x-3 sm:gap-y-5 md:gap-x-4 md:gap-y-6">
            <div className="col-start-4 col-span-4 flex justify-end gap-2">
              <button type="button" className={BUTTON_CLASS} onClick={undo}>Undo</button>
              <button type="button" className={BUTTON_CLASS} onClick={showHint}>Hint</button>
              <button type="button" className={BUTTON_CLASS} onClick={restartGame}>New Game</button>
            </div>
            <div className="col-span-3"><StockArea /></div>
            {FOUNDATION_INDICES.map(index => <FoundationPile key={index} index={index} />)}
            {TABLEAU_INDICES.map(index => <TableauColumn key={index} index={index} />)}
          </div>
        </div>
        {hasWon && <WinScreen onRestart={restartGame} />}
      </div>
    </div>
  );
}
