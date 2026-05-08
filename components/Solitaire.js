// components/Solitaire.js

"use client";

import { useEffect, memo } from "react";
import { DndProvider, useDragLayer } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";

import useGameStore from "./useGameStore";

import TableauColumn from "./TableauColumn";
import FoundationPile from "./FoundationPile";
import StockArea from "./StockArea";

const suits = ["♠", "♥", "♦", "♣"];
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const suitLetter = {
  "♠": "S",
  "♥": "H",
  "♦": "D",
  "♣": "C",
};

const CARD_WIDTH = `w-15 sm:w-18 md:w-22 lg:w-28`;
const CARD_HEIGHT = `h-24 sm:h-26 md:h-30 lg:h-40`;
const CARD_TEXT = `text-md sm:text-md md:text-base lg:text-lg`;

const ALL_CARDS = suits.flatMap((suit) =>
  ranks.map((rank) => ({
    suit,
    rank,
    image: `/cards/${rank}${suitLetter[suit]}.svg`,
  }))
);

/* -------------------- HELPERS -------------------- */

function createDeck() {
  return suits.flatMap((suit) =>
    ranks.map((rank) => ({
      suit,
      rank,
      id: `${rank}${suit}`,
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

function createGame() {
  const shuffled = shuffle(createDeck());

  const tableau = [[], [], [], [], [], [], []];

  let currentIndex = 0;

  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = shuffled[currentIndex];

      tableau[col].push({
        ...card,
        faceUp: row === col,
      });

      currentIndex++;
    }
  }

  const stock = shuffled.slice(currentIndex);

  return {
    stock,
    stockIndex: 0,
    tableau,
    foundations: [[], [], [], []],
  };
}

/* -------------------- DRAG LAYER -------------------- */

const DragPreviewCard = memo(function DragPreviewCard({ card, idx }) {
  return (
    <div
      style={{
        marginTop:
          idx === 0
            ? 0
            : `calc(-1 * (var(--card-height) - var(--card-offset)))`,
        zIndex: idx,
      }}
      className={`${CARD_WIDTH} ${CARD_HEIGHT} ${CARD_TEXT}
      relative
      transform-gpu
      will-change-transform
      flex items-center justify-center
      rounded-md border border-black bg-white`}
    >
      <img
        src={card.image}
        alt={`${card.rank}${card.suit}`}
        draggable={false}
        className="w-full h-full object-contain rounded-md pointer-events-none"
      />
    </div>
  );
});

function CustomDragLayer() {
  const { item, isDragging, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    isDragging: monitor.isDragging(),
    currentOffset: monitor.getSourceClientOffset(),
  }));

  if (!isDragging || !item?.cards) return null;

  return (
    <div
      className="fixed top-0 left-0 pointer-events-none z-50"
      style={{
        willChange: "transform",
      }}
    >
      <div
        style={{
          transform: `translate3d(${currentOffset?.x || 0}px, ${currentOffset?.y || 0
            }px, 0)`,
        }}
      >
        {item.cards.map((card, idx) => (
          <DragPreviewCard
            key={card.id}
            card={card}
            idx={idx}
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------- PAGE -------------------- */

export default function Solitaire() {
  const initializeGame = useGameStore(
    (s) => s.initializeGame
  );

  /* preload only once */
  useEffect(() => {
    ALL_CARDS.forEach((card) => {
      const img = new Image();
      img.src = card.image;
    });
  }, []);

  useEffect(() => {
    initializeGame(createGame());
  }, [initializeGame]);

  return (
    <DndProvider
      backend={TouchBackend}
      options={{
        enableMouseEvents: true,
        delayTouchStart: 120,
      }}
    >
      <CustomDragLayer />

      <div
        className="
        p-2 sm:p-3 md:p-5
        bg-green-600
        bg-[url('/GBG3.png')]
        bg-contain
        h-auto
        overflow-auto
        flex flex-col
        select-none
        touch-none
min-h-140 sm:min-h-160 md:min-h-200 lg::min-h-220"
      >
        {/* TOP ROW */}
        <div className="flex gap-4 justify-between items-start mb-6">
          <StockArea />

          <div className="flex gap-1 sm:gap-2 md:gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <FoundationPile key={i} index={i} />
            ))}
          </div>
        </div>

        {/* TABLEAU */}
        <div className="flex gap-1 sm:gap-2 md:gap-3 items-start overflow-x-auto flex-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <TableauColumn key={i} index={i} />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}