// components/Solitaire.js

"use client";

import { useEffect, useMemo } from "react";
import { DndProvider, useDrag, useDrop, useDragLayer } from "react-dnd";
import { HTML5Backend, getEmptyImage } from "react-dnd-html5-backend";
import { create } from "zustand";

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
    trash: [], // debug feature
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

const useGameStore = create((set, get) => ({
  stock: [],
  tableau: [],
  foundations: [],
  trash: [], // debug feature

  initializeGame: () => {
    const game = createGame();
    set({ ...game, stockIndex: game.stock.length - 1 }); // start at top
  },

  nextStockCard: () => {
    set((state) => {
      if (state.stock.length === 0) return state;
      const nextIndex = state.stockIndex - 1;
      return {
        stockIndex: nextIndex >= 0 ? nextIndex : 0,
      };
    });
  },

  resetStockCycle: () => {
    set((state) => ({
      stockIndex: state.stock.length - 1,
    }));
  },

  // enable flipping of top card on a tableau column

  flipTopTableauCard: (colIndex) => {
    set((state) => {
      const next = [...state.tableau];
      const pile = [...next[colIndex]];

      if (pile.length === 0) return state;

      const topIndex = pile.length - 1;

      if (!pile[topIndex].faceUp) {
        pile[topIndex] = {
          ...pile[topIndex],
          faceUp: true,
        };
      }
      next[colIndex] = pile;
      return { tableau: next };
    });
  },

  /* -------- REMOVE FROM ALL PILES -------- */

  removeCardFromAll: (cardId) => {
    set((state) => {
      const newTableau = state.tableau.map((pile) => {
        const filtered = pile.filter((c) => c.id !== cardId);
        return filtered;
      });

      return {
        stock: state.stock.filter((c) => c.id !== cardId),
        tableau: newTableau,
        foundations: state.foundations.map((pile) =>
          pile.filter((c) => c.id !== cardId)
        ),
        trash: state.trash.filter((c) => c.id !== cardId),
      };
    });

  },

  /* -------- FOUNDATION LOGIC -------- */

  canPlaceOnFoundation: (card, index) => {
    const pile = get().foundations[index];
    const topCard = pile[pile.length - 1];
    const requiredSuit = suits[index];

    if (card.suit !== requiredSuit) return false;
    if (!topCard) return card.rank === "A";
    return rankValue(card.rank) === rankValue(topCard.rank) + 1;
  },

  moveToFoundation: (card, index) => {
    if (!get().canPlaceOnFoundation(card, index)) return;

    get().removeCardFromAll(card.id);

    set((state) => {
      const next = [...state.foundations];
      next[index] = [...next[index], card];
      return { foundations: next };
    });
  },

  /* -------- TABLEAU LOGIC -------- */

  canPlaceOnTableau: (card, index) => {
    const pile = get().tableau[index];
    const bottomCard = pile[pile.length - 1];

    if (!bottomCard) return card.rank === "K";
    const isOppositeColor =
      isRed(card.suit) !== isRed(bottomCard.suit);
    const isOneLower =
      rankValue(card.rank) === rankValue(bottomCard.rank) - 1;
    return isOppositeColor && isOneLower;
  },

  moveStackToTableau: (cards, fromColumn, toColumn) => {
    const firstCard = cards[0];

    if (!get().canPlaceOnTableau(firstCard, toColumn)) return;

    if (fromColumn === null || fromColumn === undefined) {
      // remove from stock / elsewhere
      cards.forEach(c => get().removeCardFromAll(c.id));
    }

    set((state) => {
      const newTableau = [...state.tableau];

      // ONLY remove if coming from tableau
      if (fromColumn !== null && fromColumn !== undefined) {
        newTableau[fromColumn] = newTableau[fromColumn].slice(
          0,
          newTableau[fromColumn].length - cards.length
        );
      }

      // always add to destination
      newTableau[toColumn] = [
        ...newTableau[toColumn],
        ...cards.map(c => ({ ...c, faceUp: true })),
      ];

      return { tableau: newTableau };
    });

    // only flip if it came from tableau
    if (fromColumn !== null && fromColumn !== undefined) {
      get().flipTopTableauCard(fromColumn);
    }
  },

  /* -------- STOCK -------- */

  moveToStock: (card) => {
    get().removeCardFromAll(card.id);

    set((state) => ({
      stock: [...state.stock, card],
    }));
  },

  /* -------- TRASH (debug)-------- */

  trashCard: (card) => {
    get().removeCardFromAll(card.id);

    set((state) => ({
      trash: [...state.trash, card], // 🆕 store instead of delete
    }));
  },
}));

/* -------------------- UI -------------------- */

function Card({ card, columnIndex, cardIndex }) {
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
}

function DropZone({
  cards,
  onDrop,
  canDropCard,
  title,
  columnIndex,
  suit,
}) {
  const isTrash = title?.includes("Trash");

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,

    canDrop: (item) => {
      if (isTrash) return true;
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
          ${isTrash
            ? "border-red-500 bg-red-500/15"
            : isOver
              ? canDrop
                ? "border-yellow-500 bg-yellow-500/15"
                : "border-red-500 bg-red-500/15"
              : "border-gray-400"
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
              }}
            >
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
}

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
  const {
    stock,
    tableau,
    foundations,
    initializeGame,
    moveToFoundation,
    moveStackToTableau,
    canPlaceOnFoundation,
    canPlaceOnTableau,
  } = useGameStore();

  const backend = useMemo(() => HTML5Backend, []);

  useEffect(() => {
    initializeGame();
  }, []);

  const stockIndex = useGameStore((s) => s.stockIndex);
  const topStockCard = stock[stockIndex];
  const isAtEnd = stockIndex === 0;
  const resetStockCycle = useGameStore((s) => s.resetStockCycle);
  const nextStockCard = useGameStore((s) => s.nextStockCard);
  const remainingStockCount = stock.length;

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
              className="relative w-20 h-25 border-2 border-dashed bg-green-500 border-gray-400 rounded-md relative cursor-pointer flex items-center justify-center">
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
                canDropCard={(card) => canPlaceOnFoundation(card, i)}
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
              onDrop={(cards, fromColumn) =>
                moveStackToTableau(cards, fromColumn, i)
              }
              canDropCard={(card) =>
                canPlaceOnTableau(card, i)
              }
            />
          ))}

        </div>

      </div>
    </DndProvider>
  );
}