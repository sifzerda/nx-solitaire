// components/Solitaire.js

"use client";

import { useEffect, useState } from "react";

import useGameStore from "./useGameStore";
import TableauColumn from "./TableauColumn";
import FoundationPile from "./FoundationPile";
import StockArea from "./StockArea";
import WinScreen from "./WinScreen";

/* -------------------- CONSTANTS -------------------- */

const suits = ["♠", "♥", "♦", "♣"];
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const suitLetter = {
  "♠": "S",
  "♥": "H",
  "♦": "D",
  "♣": "C",
};
const gameBgClass = "bg-green-600 bg-[url('/GBG4.png')] bg-contain";

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

/* -------------------- GAME INIT -------------------- */

function createGame() {
  const shuffled = shuffle(createDeck());
  const tableau = Array.from({ length: 7 }, () => []);
  let index = 0;

  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      tableau[col].push({
        ...shuffled[index],
        faceUp: row === col,
      });

      index++;
    }
  }

  const stock = shuffled.slice(index);

  return { stock, stockIndex: 0, tableau, foundations: [[], [], [], []] };
}

/* -------------------- COMPONENT -------------------- */

export default function Solitaire() {
  const initializeGame = useGameStore((s) => s.initializeGame);

  const foundations = useGameStore((s) => s.foundations);

  const [forceWin, setForceWin] = useState(false);

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

  const hasWon =
    forceWin ||
    foundations.every((pile) => pile.length === 13);

  return (
    <div className="bg-black flex-1">
      <div className="
      mx-auto
      w-fit

        p-1 sm:p-2 md:p-4

        bg-[url('/paper.png')]
        bg-cover

        border-5 border-ridged border-green-900

        flex flex-col
        select-none touch-none

        min-h-150
        sm:min-h-200
        md:min-h-200
      "
        style={{ overscrollBehavior: "contain" }}
      >
        <button
          onClick={() => setForceWin(true)}
          className="
          fixed top-3 right-3
          bg-white text-black
          px-3 py-2 rounded-md
          shadow-md
          z-50
          text-sm
        ">
          Force Win
        </button>

        {/* TOP ROW */}
        <div className="w-full px-2 sm:px-4 md:px-6">
          <div
            className="
      mx-auto
      w-fit

      grid
      grid-cols-7

      gap-x-1
      gap-y-4

      sm:gap-x-3
      sm:gap-y-5

      md:gap-x-4
      md:gap-y-6
    "
          >
            {/* ---------- TOP ROW ---------- */}

            {/* Stock/Waste spans first 3 tableau columns */}
            <div className="col-span-3">
              <StockArea />
            </div>

            {/* Foundations align to tableau columns 4-7 */}
            {Array.from({ length: 4 }).map((_, i) => (
              <FoundationPile key={i} index={i} />
            ))}

            {/* ---------- TABLEAU ---------- */}

            {Array.from({ length: 7 }).map((_, i) => (
              <TableauColumn
                key={i}
                index={i}
              />
            ))}
          </div>
        </div>

        {hasWon ? (
          <WinScreen
            bgClass={gameBgClass}
            onRestart={() => {
              setForceWin(false);
              initializeGame(createGame());
            }}
          />
        ) : null}
      </div>
    </div>
  );
}