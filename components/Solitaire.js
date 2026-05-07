// components/Solitaire.js

"use client";

import { useEffect, useMemo, memo, useCallback } from "react";
import { DndProvider, useDrag, useDrop, useDragLayer } from "react-dnd";
import { HTML5Backend, getEmptyImage } from "react-dnd-html5-backend";

import useGameStore from "./useGameStore"

const ItemTypes = { CARD: "card" };

const suits = ["♠", "♥", "♦", "♣"];
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

/* -------------------- HELPERS -------------------- */

function createDeck() {
  return suits.flatMap((suit) =>
    ranks.map((rank) => ({
      suit,
      rank,
      id: `${rank}${suit}`,
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
        faceUp: row === col, // only top card face-up
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

const rankValue = (rank) =>
({
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
}[rank]);

const isRed = (suit) => suit === "♥" || suit === "♦";

// validate stack drops
function isValidStack(stack) {
  for (let i = 0; i < stack.length - 1; i++) {
    const current = stack[i];
    const next = stack[i + 1];

    const oppositeColor =
      isRed(current.suit) !== isRed(next.suit);

    const correctOrder =
      rankValue(current.rank) === rankValue(next.rank) + 1;

    if (!oppositeColor || !correctOrder) return false;
  }
  return true;
}

/* -------------------- STORE -------------------- */



/* -------------------- UI -------------------- */

const Card = memo(function Card({
  card,
  columnIndex,
  cardIndex,
}) {
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: ItemTypes.CARD,
    canDrag: () => {
      if (columnIndex === undefined) return true;
      const state = useGameStore.getState();
      const column = state.tableau[columnIndex];

      if (!column) return false;

      const rawStack = column.slice(cardIndex);
      const stack = rawStack.filter(c => c.faceUp);

      return isValidStack(stack);
    },
    item: () => {
      if (columnIndex === undefined) {
        return {
          cards: [card],
          fromColumn: null,
        };
      }
      const state = useGameStore.getState();
      const column = state.tableau[columnIndex];

      const stack = column.slice(cardIndex).filter(c => c.faceUp);

      return {
        cards: stack,
        fromColumn: columnIndex,
      };
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  return (
    <div ref={drag} className={`w-15 h-20 flex items-center justify-center 
      rounded-md border border-black bg-white font-bold cursor-grab
     ${isDragging ? "opacity-0" : "opacity-100"}
      ${isRed(card.suit) ? "text-red-500" : "text-black"}`}>
      {card.rank}
      {card.suit}
    </div> // above is faceUp card display
  );
});

const DropZone = memo(function DropZone({
  cards,
  onDrop,
  canDropCard,
  columnIndex,
  suit,
}) {

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,

    canDrop: (item) => {
      if (!canDropCard) return true;
      const firstCard = item.cards[0];
      return canDropCard(firstCard);
    },

    drop: (item) =>
      onDrop(item.cards, item.fromColumn),

    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  const pileHeight =
    cards.length <= 1
      ? 100
      : 100 + (cards.length - 1) * 28;

  return (
    <div className="flex flex-col items-center">

      <div
        ref={drop}
        className={`w-20 rounded-md border-2 border-dashed bg-green-500 relative transition-colors
          ${isOver
            ? canDrop
              ? "border-green-300 bg-green-800/50"
              : "border-red-500 bg-red-500/50"
            : "border-green-600"
          }
        `}
        style={{ minHeight: `${pileHeight}px` }}>

        {cards.length === 0 && suit && (
          <div
            className={`absolute inset-0 flex items-center justify-center text-3xl pointer-events-none 
              ${suit === "♥" || suit === "♦" ? "text-red-500" : "text-blue-500"} opacity-90`}>
            {suit}
          </div>
        )}

        {cards.map((card, idx) => {
          const isFaceUp = card.faceUp;
          const isTop = idx === cards.length - 1;

          return (
            <div
              key={card.id}
              className="absolute left-1/2"
              style={{
                top: `${idx * 28}px`,
                zIndex: idx,
                transform: "translateX(-50%)",
              }}>
              {isFaceUp ? (
                <Card
                  card={card}
                  origin="tableau"
                  columnIndex={columnIndex}
                  cardIndex={idx}
                />
              ) : (
                <div
                  onClick={() => {
                    if (isTop && !card.faceUp) {
                      useGameStore
                        .getState()
                        .flipTopTableauCard(
                          columnIndex
                        );
                    }
                  }}
                  className={`
                    w-15
                    h-20
                    rounded-md
                    border
                    border-black
                    bg-blue-900
                    font-bold

                    ${isTop && !card.faceUp
                      ? "cursor-pointer"
                      : "cursor-default"}
                  `}
                />
              )}
            </div>
          );
        })}

      </div>
    </div>
  );
});

/* -------------------- UI for dragging card stack -------------------- */

function CustomDragLayer() {
  const { item, isDragging, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    isDragging: monitor.isDragging(),
    currentOffset: monitor.getSourceClientOffset(),
  }));

  const renderedStack = useMemo(() => {
    if (!item?.cards) return null;

    return item.cards.map((card, idx) => (
      <div key={card.id} style={{ marginTop: idx === 0 ? 0 : -50, position: "relative", zIndex: idx, }}
        className={`w-15 h-20 flex items-center justify-center 
          rounded-md border border-black bg-white font-bold
          ${isRed(card.suit) ? "text-red-500" : "text-black"}`}>
        {card.rank}{card.suit}
      </div>
    ));
  }, [item]);

  if (!isDragging || !item?.cards) return null;

  return (
    <div className="fixed top-0 left-0 pointer-events-none z-50">
      <div style={{ transform: `translate(${currentOffset?.x || 0}px, ${currentOffset?.y || 0}px)` }}>
        {renderedStack}
      </div>
    </div>
  );
}

/* -------------------- PAGE -------------------- */

export default function Page() {
  const stock = useGameStore((s) => s.stock);
  const tableau = useGameStore((s) => s.tableau);
  const foundations = useGameStore((s) => s.foundations);
  const initializeGame = useGameStore(
    (s) => s.initializeGame
  );
  const moveToFoundation = useGameStore(
    (s) => s.moveToFoundation
  );
  const moveStackToTableau = useGameStore(
    (s) => s.moveStackToTableau
  );
  const canPlaceOnFoundation = useGameStore(
    (s) => s.canPlaceOnFoundation
  );
  const canPlaceOnTableau = useGameStore(
    (s) => s.canPlaceOnTableau
  );

  const backend = useMemo(() => HTML5Backend, []);

  useEffect(() => {
    initializeGame(createGame());
  }, []);

  const stockIndex = useGameStore((s) => s.stockIndex);
  const topStockCard = stock[stockIndex];
  const isAtEnd = stockIndex === 0;
  const resetStockCycle = useGameStore((s) => s.resetStockCycle);
  const nextStockCard = useGameStore((s) => s.nextStockCard);
  const remainingStockCount = stock.length;

  const createTableauDropHandler = useCallback(
    (index) => (cards, fromColumn) =>
      moveStackToTableau(cards, fromColumn, index),
    [moveStackToTableau]
  );

  const createTableauCanDrop = useCallback(
    (index) => (card) =>
      canPlaceOnTableau(card, index),
    [canPlaceOnTableau]
  );

  return (
    <DndProvider backend={backend}>
      <CustomDragLayer />

      <div className="p-5 bg-green-600 min-h-175 max-h-full">

        {/* ---------------- TOP ROW ---------------- */}
        <div className="flex justify-between items-start mb-6">

          {/* LEFT SIDE */}
          <div className="flex gap-3 items-start">

            {/* STOCKPILE */}
            <div onClick={nextStockCard}
              className="relative w-20 h-25 border-2 border-dashed bg-green-500 border-green-600 rounded-md cursor-pointer flex items-center justify-center">
              <div className="w-15 h-20 rounded-md bg-blue-900 border-2 border-black relative">
                <div className="absolute bottom-1 right-1 text-white text-xs">
                  {remainingStockCount}
                </div>

              </div>
            </div>

            {/* WASTE */}
            <DropZone cards={
              topStockCard
                ? [{ ...topStockCard, faceUp: true }]
                : []
            }
              onDrop={() => { }}
              canDropCard={() => false}
            />

            {/* RESET */}
            {isAtEnd && (
              <button onClick={resetStockCycle} className=" px-3 py-2 bg-yellow-400 rounded-md font-bold hover:bg-yellow-300 transition self-center">
                Reset
              </button>
            )}

          </div>

          {/* FOUNDATIONS */}
          <div className="flex gap-3">

            {foundations.map((cards, i) => (
              <DropZone
                key={i}
                cards={cards.length ? [cards[cards.length - 1]] : []}
                columnIndex={i}
                suit={suits[i]}
                onDrop={(cards) => moveToFoundation(cards[0], i)}
                canDropCard={(card) =>
                  canPlaceOnFoundation(card, i)
                }
              />
            ))}

          </div>

        </div>

        {/* ---------------- TABLEAU ---------------- */}
        <div className="flex gap-3 items-start">

          {tableau.map((cards, i) => (
            <DropZone
              key={i}
              cards={cards}
              columnIndex={i}
              onDrop={createTableauDropHandler(i)}
              canDropCard={createTableauCanDrop(i)}
            />
          ))}

        </div>

      </div>
    </DndProvider>
  );
}