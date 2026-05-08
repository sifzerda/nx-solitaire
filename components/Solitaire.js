// components/Solitaire.js

"use client";

import { useEffect, useMemo, memo, useCallback } from "react";
import { DndProvider, useDrag, useDrop, useDragLayer } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend"; // removed HTML5Backend
import { TouchBackend } from "react-dnd-touch-backend"; // mobile swipe input

import useGameStore from "./useGameStore"

const ItemTypes = { CARD: "card" };

const suits = ["♠", "♥", "♦", "♣"];
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

// responsive dimensions:
const CARD_OFFSET = typeof window !== "undefined" && window.innerWidth < 640 ? 14 : 28;

const CARD_WIDTH = `w-15 sm:w-18 md:w-22 lg:w-28`;
const CARD_HEIGHT = `h-24 sm:h-26 md:h-30 lg:h-40`;
const CARD_TEXT = `text-md sm:text-md md:text-base lg:text-lg`;

// For customDragLayer
const CARD_HEIGHT_PX = typeof window !== "undefined" && 
window.innerWidth < 640 ? 96 : window.innerWidth < 768 ? 104 : window.innerWidth < 1024 ? 104 : 160;

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

  return { stock, stockIndex: 0, tableau, foundations: [[], [], [], []] };
}

const rankValue = (rank) =>
({ A: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, J: 11, Q: 12, K: 13, }[rank]);

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

/* -------------------- UI -------------------- */

const Card = memo(function Card({ card, columnIndex, cardIndex }) {
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: ItemTypes.CARD,
    canDrag: () => {
      if (columnIndex === undefined || columnIndex === -1) return true;
      const state = useGameStore.getState();
      const column = state.tableau[columnIndex];

      if (!column) return false;

      const rawStack = column.slice(cardIndex);
      const stack = rawStack.filter(c => c.faceUp);

      return isValidStack(stack);
    },
    item: () => {
      if (columnIndex === undefined || columnIndex === -1) {  // ← add check
        return { cards: [card], fromColumn: columnIndex ?? null };
      }
      const state = useGameStore.getState();
      const column = state.tableau[columnIndex];
      const stack = column.slice(cardIndex).filter(c => c.faceUp);

      return { cards: stack, fromColumn: columnIndex };
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    }),
  }));

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  return (
    <div ref={drag} className={`${CARD_WIDTH} ${CARD_HEIGHT} ${CARD_TEXT} flex items-center justify-center rounded-md border border-black bg-white font-bold cursor-grab
     ${isDragging ? "opacity-0" : "opacity-100"}
      ${isRed(card.suit) ? "text-red-500" : "text-black"}`}>
      {card.rank}
      {card.suit}
    </div> // above is faceUp card display
  );
});

const DropZone = memo(function DropZone({ cards, onDrop, canDropCard, columnIndex, suit}) {

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
      : 100 + (cards.length - 1) * CARD_OFFSET;

  return (
    <div className="flex flex-col items-center shrink-0">

      <div ref={drop} className={`${CARD_WIDTH} ${CARD_HEIGHT} rounded-md border-2 border-dashed bg-green-500 relative transition-colors
          ${isOver ? canDrop ? "border-green-300 bg-green-800/50" : "border-red-500 bg-red-500/50" : "border-green-600"}`
      } style={{ minHeight: `${pileHeight}px` }}>

        {cards.length === 0 && suit && (
          <div className={`absolute inset-0 flex items-center justify-center text-xl sm:text-2xl md:text-3xl pointer-events-none 
              ${suit === "♥" || suit === "♦" ? "text-red-500" : "text-blue-500"} opacity-90`}>
            {suit}
          </div>
        )}

        {cards.map((card, idx) => {
          const isFaceUp = card.faceUp; const isTop = idx === cards.length - 1;

          return (
            <div key={card.id} className="absolute left-1/2"
              style={{ top: `${idx * CARD_OFFSET}px`, zIndex: idx, transform: "translateX(-50%)", }}>
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
                        .flipTopTableauCard( columnIndex );
                    }
                  }}
                  className={` ${CARD_WIDTH} ${CARD_HEIGHT} rounded-md border border-black bg-blue-900 font-bold
                    ${isTop && !card.faceUp ? "cursor-pointer" : "cursor-default"} `} />
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
      <div
        key={card.id}
        style={{
          marginTop: idx === 0 ? 0 : -(CARD_HEIGHT_PX - CARD_OFFSET),
          position: "relative",
          zIndex: idx,
        }}
        className={`${CARD_WIDTH} ${CARD_HEIGHT} ${CARD_TEXT} flex items-center justify-center rounded sm:rounded-md border border-black bg-white font-bold
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

  const backend = useMemo(() => TouchBackend, []);

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
    <DndProvider backend={backend} options={{ enableMouseEvents: true, delayTouchStart: 120 }}>
      <CustomDragLayer />

      <div className="p-2 sm:p-3 md:p-5 bg-green-600 min-h-200 overflow-auto flex flex-col select-none">

        {/* ---------------- TOP ROW ---------------- */}
        <div className="flex gap-4 lg:flex-row justify-between items-start mb-6">

          {/* LEFT SIDE */}
          <div className="flex gap-1 sm:gap-2 md:gap-3 items-center">

            {/* STOCKPILE */}
            <div onClick={nextStockCard}
              className={`relative 
              ${CARD_WIDTH} ${CARD_HEIGHT} border-2 border-dashed bg-green-500 border-green-600 rounded-md cursor-pointer flex items-center justify-center`}>
              <div className={`${CARD_WIDTH} ${CARD_HEIGHT} rounded-md bg-blue-900 border-2 border-black relative`}>
                <div className="absolute bottom-1 right-1 text-white text-[10px] sm:text-xs">
                  {remainingStockCount}
                </div>

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
              <button onClick={resetStockCycle} className="px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm bg-yellow-400 rounded-md font-bold hover:bg-yellow-300 transition self-center">
                Reset
              </button>
            )}

          </div>

          {/* FOUNDATIONS */}
          <div className="flex gap-1 sm:gap-2 md:gap-3">

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
        <div className=" flex gap-1 sm:gap-2 md:gap-3 items-start overflow-x-auto flex-1">

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