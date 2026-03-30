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
  return suits.flatMap((suit) => ranks.map((rank) => ({ suit, rank, id: `${rank}${suit}` })));
}

// Single Card component
function Card({ card, moveCard }) {
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
        borderRadius: "4px",
        padding: "8px",
        backgroundColor: "white",
        width: "60px",
        textAlign: "center",
        margin: "4px",
      }}
    >
      {card.rank}{card.suit}
    </div>
  );
}

// Drop zone (foundation, tableau, etc.)
function DropZone({ cards, moveCard }) {
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: (item) => moveCard(item.card),
  }));

  return (
    <div
      ref={drop}
      style={{
        minHeight: "80px",
        minWidth: "70px",
        border: "2px dashed gray",
        borderRadius: "6px",
        margin: "8px",
        padding: "4px",
        display: "flex",
        flexWrap: "wrap",
      }}
    >
      {cards.map((card) => (
        <Card key={card.id} card={card} moveCard={moveCard} />
      ))}
    </div>
  );
}

export default function Page() {
  const [deck, setDeck] = useState(createDeck());
  const [foundations, setFoundations] = useState([[], [], [], []]);

  // Move a card to the first available foundation (for simplicity)
  const moveCard = (card, foundationIndex = 0) => {
    setDeck((prev) => prev.filter((c) => c.id !== card.id));
    setFoundations((prev) => {
      const newFoundations = [...prev];
      newFoundations[foundationIndex] = [...newFoundations[foundationIndex], card];
      return newFoundations;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <h1 style={{ textAlign: "center" }}>Simple Drag & Drop Solitaire (No Rules)</h1>

      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
        {foundations.map((cards, i) => (
          <DropZone
            key={i}
            cards={cards}
            moveCard={(card) => moveCard(card, i)}
          />
        ))}
      </div>

      <h2 style={{ textAlign: "center" }}>Deck</h2>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
        {deck.map((card) => (
          <Card key={card.id} card={card} moveCard={moveCard} />
        ))}
      </div>
    </DndProvider>
  );
}