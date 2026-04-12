"use client";

import { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ItemTypes = {
  CARD: "card",
};

const suits = ["♠", "♥", "♦", "♣"];
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

// Generate a standard 52-card deck
function createDeck() {
  return suits.flatMap((suit) =>
    ranks.map((rank) => ({
      suit,
      rank,
      id: `${rank}${suit}`,
    }))
  );
}

// Fisher–Yates Shuffle 
function shuffle(array) {
  const arr = [...array]; // don't mutate original
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // swap
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Create starting game state
function createGame() {
  const shuffled = shuffle(createDeck());

  const tableau = [[], [], [], [], [], [], []];

  let currentIndex = 0;

  // Solitaire-style tableau:
  // Column 1 = 1 card
  // Column 2 = 2 cards
  // Column 3 = 3 cards
  // ...
  // Column 7 = 7 cards
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      tableau[col].push(shuffled[currentIndex]);
      currentIndex++;
    }
  }

  // Remaining cards go into stock/deck
  const stock = shuffled.slice(currentIndex);

  return {
    tableau,
    stock,
    foundations: [[], [], [], []],
  };
}

// Card component
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

// Generic drop zone
function DropZone({ cards, onDrop, title }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: (item) => onDrop(item.card),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {title && (
        <div
          style={{
            color: "white",
            marginBottom: "6px",
            fontWeight: "bold",
          }}
        >
          {title}
        </div>
      )}

      <div
        ref={drop}
        style={{
          minHeight: "100px",
          minWidth: "80px",
          border: `2px dashed ${isOver ? "#4caf50" : "#999"}`,
          borderRadius: "8px",
          padding: "6px",
          backgroundColor: isOver ? "rgba(76,175,80,0.15)" : "rgba(255,255,255,0.05)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transition: "all 0.15s ease",
        }}
      >
        {cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  const initialGame = createGame();

  const [stock, setStock] = useState(initialGame.stock);
  const [tableau, setTableau] = useState(initialGame.tableau);
  const [foundations, setFoundations] = useState(initialGame.foundations);

  // Remove a card from every pile before adding it somewhere else
  const removeCardFromAll = (cardId) => {
    setStock((prev) => prev.filter((c) => c.id !== cardId));

    setTableau((prev) =>
      prev.map((pile) => pile.filter((c) => c.id !== cardId))
    );

    setFoundations((prev) =>
      prev.map((pile) => pile.filter((c) => c.id !== cardId))
    );
  };

  const moveToFoundation = (card, foundationIndex) => {
    removeCardFromAll(card.id);

    setFoundations((prev) => {
      const next = [...prev];
      next[foundationIndex] = [...next[foundationIndex], card];
      return next;
    });
  };

  const moveToTableau = (card, tableauIndex) => {
    removeCardFromAll(card.id);

    setTableau((prev) => {
      const next = [...prev];
      next[tableauIndex] = [...next[tableauIndex], card];
      return next;
    });
  };

  const moveToStock = (card) => {
    removeCardFromAll(card.id);

    setStock((prev) => [...prev, card]);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#00a2ff",
          padding: "20px",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "white",
            marginBottom: "30px",
          }}
        >
          Simple Drag & Drop Solitaire
        </h1>

        <h2 style={{ textAlign: "center", color: "white" }}>Foundations</h2>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            marginBottom: "30px",
            flexWrap: "wrap",
          }}
        >
          {foundations.map((cards, i) => (
            <DropZone
              key={i}
              cards={cards}
              title={`Foundation ${i + 1}`}
              onDrop={(card) => moveToFoundation(card, i)}
            />
          ))}
        </div>

        <h2 style={{ textAlign: "center", color: "white" }}>Tableau</h2>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            marginBottom: "30px",
            flexWrap: "wrap",
          }}
        >
          {tableau.map((cards, i) => (
            <DropZone
              key={i}
              cards={cards}
              title={`Column ${i + 1}`}
              onDrop={(card) => moveToTableau(card, i)}
            />
          ))}
        </div>

        <h2 style={{ textAlign: "center", color: "white" }}>Deck / Stock</h2>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <DropZone
            cards={stock}
            title="Stock"
            onDrop={(card) => moveToStock(card)}
          />
        </div>
      </div>
    </DndProvider>
  );
}