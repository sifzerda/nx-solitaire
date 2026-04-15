// stockpile facedown, non draggable

"use client";

import { useEffect } from "react";
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
    set(game);
  },

  /* -------- REMOVE FROM ALL PILES -------- */

  removeCardFromAll: (cardId) => {
    set((state) => ({
      stock: state.stock.filter((c) => c.id !== cardId),
      tableau: state.tableau.map((pile) =>
        pile.filter((c) => c.id !== cardId)
      ),
      foundations: state.foundations.map((pile) =>
        pile.filter((c) => c.id !== cardId)
      ),
      trash: state.trash.filter((c) => c.id !== cardId), // debug feature
    }));
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
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
        border: "1px solid black",
        borderRadius: "6px",
        padding: "8px",
        backgroundColor: "white",
        color: isRed(card.suit) ? "red" : "black",
        width: "60px",
        height: "80px",
        margin: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
      }}
    >
      {card.rank}
      {card.suit}
    </div>
  );
}

function DropZone({ cards, onDrop, canDropCard, title }) {
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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {title && (
        <div style={{ color: "white", marginBottom: 6 }}>
          {title}
        </div>
      )}

      <div
        ref={drop}
        style={{
          minHeight: "100px",
          minWidth: "80px",
          border: `2px dashed ${isTrash ? "red" : isOver ? (canDrop ? "green" : "red") : "#999"
            }`,
          backgroundColor: isTrash
            ? "rgba(255,0,0,0.15)"
            : isOver
              ? canDrop
                ? "rgba(0,255,0,0.15)"
                : "rgba(255,0,0,0.15)"
              : "transparent",
          padding: "6px",
        }}
      >
        {cards.map((card, idx) => {
          const isFaceUp = card.faceUp;

          return (
            <div
              key={card.id}
              style={{
                marginTop: idx === 0 ? 0 : -60,
              }}
            >
              {isFaceUp ? (
                <Card card={card} />
              ) : (
                <div
                  style={{
                    width: "60px",
                    height: "80px",
                    borderRadius: "6px",
                    backgroundColor: "navy",
                    border: "1px solid black",
                    margin: "4px",
                  }}
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
    moveToStock,
    canPlaceOnFoundation,
    canPlaceOnTableau,
  } = useGameStore();

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ padding: 20, background: "#0b5", minHeight: "100vh" }}>
        <h2 style={{ color: "white" }}>Foundations</h2>

        <div style={{ display: "flex", gap: 10 }}>
          {foundations.map((cards, i) => (
            <DropZone
              key={i}
              cards={cards}
              title={`Foundation ${suits[i]}`}
              onDrop={(card) => moveToFoundation(card, i)}
              canDropCard={(card) => canPlaceOnFoundation(card, i)}
            />
          ))}
        </div>

        {/* 🗑️ TRASH MOVED HERE */}
        <h2 style={{ color: "white", marginTop: 20 }}>
          Trash (Debug)
        </h2>

        <DropZone
          cards={trash}
          title="🗑️ Trash"
          onDrop={(card) => trashCard(card)}
          canDropCard={() => true}
        />

        <h2 style={{ color: "white" }}>Tableau</h2>

        <div style={{ display: "flex", gap: 10 }}>
          {tableau.map((cards, i) => (
            <DropZone
              key={i}
              cards={cards}
              title={`Column ${i + 1}`}
              onDrop={(card) => moveToTableau(card, i)}
              canDropCard={(card) => canPlaceOnTableau(card, i)}
            />
          ))}
        </div>

        <h2 style={{ color: "white" }}>Stock</h2>

        <DropZone
          cards={stock}
          title="Stock"
          onDrop={moveToStock}
          canDropCard={() => false}
        />

      </div>
    </DndProvider>
  );
}