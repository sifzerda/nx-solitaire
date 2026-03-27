"use client";

import { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ItemTypes = {
  CARD: "card",
};

const suits = ["♠", "♥", "♦", "♣"];
const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

function createDeck() {
  const deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ id: `${value}${suit}`, suit, value });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
}

/* ---------------- CARD ---------------- */

function Card({ card, index, pileId, moveCard }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: { card, from: pileId, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className="w-16 h-24 border bg-white flex items-center justify-center cursor-move"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {card.id}
    </div>
  );
}

/* ---------------- PILE ---------------- */

function Pile({ id, cards, moveCard }) {
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: (item) => {
      moveCard(item, id);
    },
  }));

  return (
    <div
      ref={drop}
      className="w-20 min-h-32 border p-2 flex flex-col gap-2"
    >
      {cards.map((card, idx) => (
        <Card
          key={card.id}
          card={card}
          index={idx}
          pileId={id}
          moveCard={moveCard}
        />
      ))}
    </div>
  );
}

/* ---------------- MAIN GAME ---------------- */

export default function SolitaireDemo() {
  const [tableau, setTableau] = useState(null);
  const [foundation, setFoundation] = useState(null);
  const [stock, setStock] = useState(null);

  // ✅ Initialize game ONLY on client
  useEffect(() => {
    const deck = createDeck();

    const t = [[], [], [], [], [], [], []];

    for (let i = 0; i < 7; i++) {
      for (let j = 0; j <= i; j++) {
        t[i].push(deck.pop());
      }
    }

    const remainingStock = deck;

    setTableau(t);
    setFoundation([[], [], [], []]);
    setStock(remainingStock.slice(0, 24));
  }, []);

  function moveCard(item, targetPileId) {
    if (!tableau || !foundation || !stock) return;

    const { card, from } = item;

    let newTableau = [...tableau];
    let newFoundation = [...foundation];
    let newStock = [...stock];

    const removeFromPile = (pile, cardId) =>
      pile.filter((c) => c.id !== cardId);

    // remove from source
    if (from.startsWith("tableau-")) {
      const idx = parseInt(from.split("-")[1]);
      newTableau[idx] = removeFromPile(newTableau[idx], card.id);
    }

    if (from.startsWith("foundation-")) {
      const idx = parseInt(from.split("-")[1]);
      newFoundation[idx] = removeFromPile(newFoundation[idx], card.id);
    }

    if (from === "stock") {
      newStock = removeFromPile(newStock, card.id);
    }

    // add to target
    if (targetPileId.startsWith("tableau-")) {
      const idx = parseInt(targetPileId.split("-")[1]);
      newTableau[idx] = [...newTableau[idx], card];
    }

    if (targetPileId.startsWith("foundation-")) {
      const idx = parseInt(targetPileId.split("-")[1]);
      newFoundation[idx] = [...newFoundation[idx], card];
    }

    if (targetPileId === "stock") {
      newStock = [...newStock, card];
    }

    setTableau(newTableau);
    setFoundation(newFoundation);
    setStock(newStock);
  }

  // ✅ Prevent hydration mismatch
  if (!tableau || !foundation || !stock) {
    return <div className="p-6 text-white">Loading game...</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6">
        <h1 className="text-2xl mb-4">
          Simple DnD Solitaire (No Rules)
        </h1>

        {/* Stock */}
        <div className="mb-4">
          <h2>Stock</h2>
          <Pile id="stock" cards={stock} moveCard={moveCard} />
        </div>

        {/* Foundation */}
        <div className="flex gap-4 mb-4">
          {foundation.map((pile, i) => (
            <div key={i}>
              <h2>Foundation {i + 1}</h2>
              <Pile
                id={`foundation-${i}`}
                cards={pile}
                moveCard={moveCard}
              />
            </div>
          ))}
        </div>

        {/* Tableau */}
        <div className="grid grid-cols-7 gap-4">
          {tableau.map((pile, i) => (
            <div key={i}>
              <h2 className="text-sm">Tableau {i + 1}</h2>
              <Pile
                id={`tableau-${i}`}
                cards={pile}
                moveCard={moveCard}
              />
            </div>
          ))}
        </div>
      </div>
    </DndProvider>
  );
}