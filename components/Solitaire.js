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

const ranks = [ "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K" ];

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
    <div
      className="
        w-screen
        max-w-screen
        overflow-x-hidden

        p-1 sm:p-2 md:p-4

        bg-green-600
        bg-[url('/GBG4.png')]
        bg-contain

        flex flex-col
        select-none touch-none

        min-h-screen
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
        "
      >
        Force Win
      </button>

      {/* TOP ROW */}
      <div className="flex justify-between items-start gap-2 mb-3 sm:mb-5">
        <StockArea />

        <div className="flex gap-1 sm:gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <FoundationPile key={i} index={i} />
          ))}
        </div>
      </div>

      {/* TABLEAU */}
      <div
        className="
          flex
          flex-1
          items-start

          gap-[2px] sm:gap-2

          min-w-0
          w-full
        "
      >
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="
              flex-1
              min-w-0
            "
          >
            <TableauColumn index={i} />
          </div>
        ))}
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
  );
}