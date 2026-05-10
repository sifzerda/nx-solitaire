// components/DropZone.js

"use client";

import { useEffect, memo, useCallback } from "react";
import { useDrop, useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import useGameStore from "./useGameStore";

/* ---------------- TYPES ---------------- */

const ItemTypes = { CARD: "card" };

/* ---------------- CONSTANTS ---------------- */

const CARD_WIDTH = `w-15 sm:w-18 md:w-22 lg:w-28`;
const CARD_HEIGHT = `h-24 sm:h-26 md:h-30 lg:h-40`;
const CARD_TEXT = `text-md sm:text-md md:text-base lg:text-lg`;

/* ---------------- ENGINE HELPERS ---------------- */

const rankValue = {
  A: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  J: 11,
  Q: 12,
  K: 13,
};

const RED_SUITS = new Set(["♥", "♦"]);

const isRed = (suit) => RED_SUITS.has(suit);

/* ---------------- STACK VALIDATION ---------------- */

function isValidStack(stack) {
  for (let i = 0; i < stack.length - 1; i++) {
    const a = stack[i];
    const b = stack[i + 1];

    if (
      isRed(a.suit) === isRed(b.suit) ||
      rankValue[a.rank] !== rankValue[b.rank] + 1
    ) {
      return false;
    }
  }
  return true;
}

/* =======================================================
   CARD COMPONENT (OPTIMIZED)
======================================================= */

const Card = memo(function Card({
  card,
  columnIndex,
  cardIndex,
}) {
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: ItemTypes.CARD,

    canDrag: () => {
      if (columnIndex == null || columnIndex === -1) return true;

      const state = useGameStore.getState();
      const column = state.tableau[columnIndex];
      if (!column) return false;

      const stack = column
        .slice(cardIndex)
        .filter((c) => c.faceUp);

      return isValidStack(stack);
    },

    item: () => {
      const state = useGameStore.getState();

      if (columnIndex == null || columnIndex === -1) {
        return {
          cards: [card],
          fromColumn: columnIndex ?? null,
        };
      }

      const column = state.tableau[columnIndex];

      const stack = column
        .slice(cardIndex)
        .filter((c) => c.faceUp);

      return {
        cards: stack,
        fromColumn: columnIndex,
      };
    },

    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  return (
    <div
      ref={drag}
      className={`
        ${CARD_WIDTH}
        ${CARD_HEIGHT}
        ${CARD_TEXT}

        flex
        items-center
        justify-center

        rounded-md
        border
        border-black
        bg-white

        cursor-grab
        transform-gpu
        will-change-transform

        ${isDragging ? "opacity-0" : "opacity-100"}
      `}
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

/* =======================================================
   DROPZONE COMPONENT (OPTIMIZED)
======================================================= */

const DropZone = memo(function DropZone({
  cards,
  onDrop,
  canDropCard,
  columnIndex,
  suit,
}) {
  const flipTopTableauCard = useGameStore(
    useCallback((s) => s.flipTopTableauCard, [])
  );

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,

    canDrop: (item) => {
      if (!canDropCard) return true;
      return canDropCard(item.cards[0]);
    },

    drop: (item) => {
      onDrop(item.cards, item.fromColumn);
    },

    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const pileHeight = cards.length <= 1
    ? 100
    : 100 + (cards.length - 1) * 28;

  return (
    <div className="flex flex-col items-center shrink-0">
      <div
        ref={drop}
        className={`
          ${CARD_WIDTH}
          ${CARD_HEIGHT}

          relative
          rounded-md
          border-2
          border-dashed
          bg-green-500
          transition-colors

          ${
            isOver
              ? canDrop
                ? "border-green-300 bg-green-800/50"
                : "border-red-500 bg-red-500/50"
              : "border-green-600"
          }
        `}
        style={{ minHeight: `${pileHeight}px` }}
      >
        {/* EMPTY SUIT PLACEHOLDER */}
        {cards.length === 0 && suit && (
          <div
            className={`
              absolute inset-0 flex items-center justify-center
              text-xl sm:text-2xl md:text-3xl
              pointer-events-none

              ${
                suit === "♥" || suit === "♦"
                  ? "text-red-500"
                  : "text-blue-500"
              }

              opacity-90
            `}
          >
            {suit}
          </div>
        )}

        {/* CARDS */}
        {cards.map((card, idx) => {
          const isFaceUp = card.faceUp;
          const isTop = idx === cards.length - 1;

          return (
            <div
              key={card.id}
              className="absolute left-1/2"
              style={{
                top: `calc(${idx} * var(--card-offset))`,
                zIndex: idx,
                transform: "translateX(-50%)",
              }}
            >
              {isFaceUp ? (
                <Card
                  card={card}
                  columnIndex={columnIndex}
                  cardIndex={idx}
                />
              ) : (
                <div
                  onClick={() => {
                    if (isTop && !card.faceUp) {
                      flipTopTableauCard(columnIndex);
                    }
                  }}
                  className={`
                    ${CARD_WIDTH}
                    ${CARD_HEIGHT}

                    rounded-md
                    overflow-hidden
                    shrink-0

                    ${
                      isTop && !card.faceUp
                        ? "cursor-pointer"
                        : "cursor-default"
                    }
                  `}
                >
                  <div className="w-full h-full bg-[url('/cards/FDC.png')] bg-cover bg-center" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default DropZone;