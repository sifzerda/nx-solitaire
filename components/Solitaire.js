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
const foundationSuits = ["♠", "♥", "♦", "♣"];

/* -------------------- GAME HELPERS -------------------- */

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
      tableau[col].push(shuffled[currentIndex]);
      currentIndex++;
    }
  }

  const stock = shuffled.slice(currentIndex);

  return {
    stock,
    tableau,
    foundations: [[], [], [], []],
  };
}

const rankValue = (rank) => {
  const map = {
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
  return map[rank];
};

/* -------------------- ZUSTAND STORE -------------------- */

const useGameStore = create((set, get) => ({
  stock: [],
  tableau: [],
  foundations: [],

  initializeGame: () => {
    const game = createGame();
    set({
      stock: game.stock,
      tableau: game.tableau,
      foundations: game.foundations,
    });
  },

  removeCardFromAll: (cardId) => {
    set((state) => ({
      stock: state.stock.filter((c) => c.id !== cardId),
      tableau: state.tableau.map((pile) =>
        pile.filter((c) => c.id !== cardId)
      ),
      foundations: state.foundations.map((pile) =>
        pile.filter((c) => c.id !== cardId)
      ),
    }));
  },

  canPlaceOnFoundation: (card, index) => {
    const foundationPile = get().foundations[index];
    const topCard = foundationPile[foundationPile.length - 1];
    const requiredSuit = foundationSuits[index];

    // ❗ Must match the foundation's suit ALWAYS
    if (card.suit !== requiredSuit) {
      return false;
    }

    // First card must be Ace of that suit
    if (!topCard) {
      return card.rank === "A";
    }

    // Must be next rank in same suit
    return rankValue(card.rank) === rankValue(topCard.rank) + 1;
  },

  moveToFoundation: (card, index) => {
    if (!get().canPlaceOnFoundation(card, index)) {
      console.log("Invalid foundation move", card);
      return;
    }

    get().removeCardFromAll(card.id);

    set((state) => {
      const next = [...state.foundations];
      next[index] = [...next[index], card];
      return { foundations: next };
    });
  },

  moveToTableau: (card, index) => {
    get().removeCardFromAll(card.id);

    set((state) => {
      const next = [...state.tableau];
      next[index] = [...next[index], card];
      return { tableau: next };
    });
  },

  moveToStock: (card) => {
    get().removeCardFromAll(card.id);

    set((state) => ({
      stock: [...state.stock, card],
    }));
  },

}));


/* -------------------- UI COMPONENTS -------------------- */

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
        opacity: isDragging ? "0.5" : "1",
        cursor: "grab",
        border: "1px solid black",
        borderRadius: "6px",
        padding: "8px",
        backgroundColor: "white",
        color: card.suit === "♥" || card.suit === "♦" ? "red" : "black",
        width: "60px",
        height: "80px",
        textAlign: "center",
        margin: "4px",
        fontSize: "18px",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        userSelect: "none",
      }}
    >
      {card.rank}
      {card.suit}
    </div>
  );
}

function DropZone({ cards, onDrop, canDropCard, title }) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,

    canDrop: (item) => {
      return canDropCard ? canDropCard(item.card) : true;
    },

    drop: (item) => {
      onDrop(item.card);
    },

    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {title && (
        <div style={{ color: "white", marginBottom: "6px", fontWeight: "bold" }}>
          {title}
        </div>
      )}

      <div
        ref={drop}
        style={{
          minHeight: "100px",
          minWidth: "80px",
          border: `2px dashed ${isOver ? (canDrop ? "#4caf50" : "red") : "#999"
            }`,
          borderRadius: "8px",
          padding: "6px",
          backgroundColor: isOver
            ? canDrop
              ? "rgba(76,175,80,0.15)"
              : "rgba(255,0,0,0.15)"
            : "rgba(255,255,255,0.05)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
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
    moveToTableau,
    moveToStock,
    canPlaceOnFoundation,
  } = useGameStore();

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ minHeight: "100vh", backgroundColor: "#00a2ff", padding: "20px" }}>
        <h1 style={{ textAlign: "center", color: "white" }}>
          Simple Drag & Drop Solitaire (Zustand)
        </h1>

        <h2 style={{ textAlign: "center", color: "white" }}>Foundations</h2>
        <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
          {foundations.map((cards, i) => (
            <DropZone
              key={i}
              cards={cards}
              title={`Foundation ${foundationSuits[i]}`}
              onDrop={(card) => moveToFoundation(card, i)}
              canDropCard={(card) => canPlaceOnFoundation(card, i)}
            />
          ))}
        </div>

        <h2 style={{ textAlign: "center", color: "white" }}>Tableau</h2>
        <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
          {tableau.map((cards, i) => (
            <DropZone
              key={i}
              cards={cards}
              title={`Column ${i + 1}`}
              onDrop={(card) => moveToTableau(card, i)}
            />
          ))}
        </div>

        <h2 style={{ textAlign: "center", color: "white" }}>Stock</h2>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <DropZone cards={stock} title="Stock" onDrop={moveToStock} />
        </div>
      </div>
    </DndProvider>
  );
}