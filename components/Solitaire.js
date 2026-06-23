// components/Solitaire.js

"use client";

import { useEffect, useState, useCallback } from "react";
import useGameStore from "./useGameStore";
import TableauColumn from "./TableauColumn";
import FoundationPile from "./FoundationPile";
import StockArea from "./StockArea";
import WinScreen from "./WinScreen";

import createGame from "./createGame";

/* -------------------- CONSTANTS -------------------- */

const suits = ["♠", "♥", "♦", "♣"];
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const suitLetter = { "♠": "S", "♥": "H", "♦": "D", "♣": "C" };
const gameBgClass = "bg-green-600 bg-[url('/paper.png')] bg-contain";

/* -------------------- DECK -------------------- */

function createDeck() {
  return suits.flatMap((suit) =>
    ranks.map((rank) => ({
      suit, rank, id: `${rank}${suit}`,
      image: `/cards/${rank}${suitLetter[suit]}.svg`,
    }))
  );
}

function shuffle(array) {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* -------------------- COMPONENT -------------------- */
export default function Solitaire() {
  const [debugWin, setDebugWin] = useState(false);
  const initializeGame = useGameStore((s) => s.initializeGame);
  const foundations = useGameStore((s) => s.foundations);

  const undo = useGameStore((s) => s.undo);
  const showHint = useGameStore((s) => s.showHint);

const restartGame = useCallback(() => {
  setDebugWin(false);
  initializeGame(createGame());
}, [initializeGame]);

  /* preload images */
  useEffect(() => {
    const images = createDeck().map((card) => {
      const img = new Image();
      img.src = card.image;
      return img;
    });

    return () => {
      images.length = 0;
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



<div className="flex gap-2 mb-3">
  <button
    onClick={undo}
    className="
      px-3 py-1
      rounded
      bg-white
      text-black
      cursor-pointer
    "
  >
    Undo
  </button>

  <button
    onClick={showHint}
    className="
      px-3 py-1
      rounded
      bg-white
      text-black
      cursor-pointer
    "
  >
    Hint
  </button>

  <button
    onClick={restartGame}
    className="
      px-3 py-1
      rounded
      bg-white
      text-black
      cursor-pointer
    "
  >
    New Game
  </button>
</div>



        {/* TOP ROW */}
        <div className="w-full px-2 sm:px-4 md:px-6">
          <div className="mx-auto w-fit grid grid-cols-7 gap-x-1 gap-y-4 sm:gap-x-3 sm:gap-y-5 md:gap-x-4 md:gap-y-6">
            {/* ---------- TOP ROW ---------- */}
            {/* ---------- <button onClick={() => setDebugWin(v => !v)} className="fixed bottom-4 right-4 z-[9999] bg-red-600 text-white px-4 py-2 rounded">{debugWin ? "Hide Win" : "Test Win"}</button> ---------- */}

            {/* Stock/Waste spans first 3 tableau columns */}
            <div className="col-span-3">
              <StockArea />
            </div>

            {/* Foundations align to tableau columns 4-7 */}
            {Array.from({ length: 4 }).map((_, i) => (<FoundationPile key={i} index={i} />))}

            {/* ---------- TABLEAU ---------- */}

            {Array.from({ length: 7 }).map((_, i) => (<TableauColumn key={i} index={i} />))}
          </div>
        </div>

        {(hasWon || debugWin) ? (
          <WinScreen bgClass={gameBgClass} onRestart={restartGame} />
        ) : null}
      </div>
    </div>
  );
}