// components/Solitaire.js

"use client";

import { useEffect, useMemo } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { create } from "zustand";

const ItemTypes = {
  CARD: "card",
};

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
    stockIndex: 0, // stock cycle loop
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

  moveToTableau: (card, index) => {
    if (!get().canPlaceOnTableau(card, index)) return;

    get().removeCardFromAll(card.id);

    set((state) => {
      const next = [...state.tableau];
      next[index] = [
        ...next[index],
        { ...card, faceUp: true },
      ];
      return { tableau: next };
    });
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

function Card({ card }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: { card },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag}
      className={`w-[60px] h-[80px] m-1 flex items-center justify-center
      rounded-md border border-black bg-white font-bold cursor-grab
      ${isDragging ? "opacity-50" : "opacity-100"}
      ${isRed(card.suit) ? "text-red-500" : "text-black"}
    `}>
      {card.rank}
      {card.suit}
    </div>
  );
}

function DropZone({ cards, onDrop, canDropCard, title, columnIndex }) {
  const isTrash = title?.includes("Trash");

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    canDrop: (item) =>
      isTrash ? true : canDropCard ? canDropCard(item.card) : true,
    drop: (item) => onDrop(item.card),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  return (
    <div className="flex flex-col items-center">
      {title && (
        <div className="text-white mb-1.5">
          {title}
        </div>
      )}

      <div ref={drop}
        className={`min-h-[100px] min-w-[80px] p-1.5 border-2 border-dashed
        ${isTrash
            ? "border-red-500 bg-red-500/15"
            : isOver
              ? canDrop
                ? "border-green-500 bg-green-500/15"
                : "border-red-500 bg-red-500/15"
              : "border-gray-400"
          }
      `}
      >
        {cards.map((card, idx) => {
          const isFaceUp = card.faceUp;
          const isTop = idx === cards.length - 1;

          return (
            <div key={card.id} className={idx === 0 ? "" : "-mt-[60px]"}>
              {isFaceUp ? (
                <Card card={card} />
              ) : (
                <div onClick={() => {
                    if (isTop && !card.faceUp) {
                      useGameStore
                        .getState()
                        .flipTopTableauCard(columnIndex);
                    }
                  }}
                  className={`w-[60px] h-[80px] m-1 rounded-md border border-black bg-blue-900
                  ${isTop && !card.faceUp
                      ? "cursor-pointer"
                      : "cursor-default"
                    }
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

/* -------------------- PAGE -------------------- */

export default function Page() {
  const {
    stock,
    tableau,
    foundations,
    trash, // debug
    trashCard, // debug
    initializeGame,
    moveToFoundation,
    moveToTableau,
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
      <div className="p-5 bg-green-700 min-h-screen">
        <h2 className="text-white text-xl font-semibold mb-2">
          Foundations
        </h2>

        <div className="flex gap-2.5">
          {foundations.map((cards, i) => (
            <DropZone
              key={i}
              cards={cards}
              columnIndex={i}
              title={`Foundation ${suits[i]}`}
              onDrop={(card) => moveToFoundation(card, i)}
              canDropCard={(card) => canPlaceOnFoundation(card, i)}
            />
          ))}
        </div>

        {/* 🗑️ TRASH MOVED HERE */}
        <h2 className="text-white mt-5">
          Trash (Debug)
        </h2>

        <DropZone
          cards={trash}
          title="🗑️ Trash"
          onDrop={(card) => trashCard(card)}
          canDropCard={() => true}
        />

        <h2 className="text-white">Tableau</h2>

        <div className="flex gap-2.5">
          {tableau.map((cards, i) => (
            <DropZone
              key={i}
              cards={cards}
              columnIndex={i}
              title={`Column ${i + 1}`}
              onDrop={(card) => moveToTableau(card, i)}
              canDropCard={(card) => canPlaceOnTableau(card, i)}
            />
          ))}
        </div>

        <h2 className="text-white">Stock</h2>
        <div className="flex gap-3 items-center">

          {/* 🔵 STOCK PILE (face-down stack) */}
          <div onClick={() => nextStockCard()} 
          className="w-[80px] h-[100px] rounded-md bg-[#001f3f] border-2 border-black cursor-pointer relative">
            
            {/* small indicator of how many cards remain */}
            <div className="absolute bottom-1 right-1 text-white text-xs">
              {remainingStockCount}
            </div>
          </div>

          {/* 🟢 TOP STOCK CARD (FACE UP) */}
          {topStockCard && (
            <DropZone
              cards={[{ ...topStockCard, faceUp: true }]}
              title="Top Card"
              onDrop={() => { }}
              canDropCard={() => false}
            />
          )}

          {/* 🔁 RESET BUTTON */}
          {isAtEnd && (
            <button
              onClick={resetStockCycle}
              className="ml-2 px-3 py-2 bg-yellow-400 rounded-md font-bold cursor-pointer hover:bg-yellow-300 transition">
              Reset Cycle
            </button>
          )}

        </div>
      </div>
    </DndProvider>
  );
}