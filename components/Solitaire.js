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
      className={`
        w-[60px] h-[80px] m-1 flex items-center justify-center
        rounded-md border border-black bg-white font-bold text-lg
        shadow-md cursor-grab select-none
        ${card.suit === "♥" || card.suit === "♦" ? "text-red-500" : "text-black"}
        ${isDragging ? "opacity-50" : "opacity-100"}
      `}
    >
      {card.rank}{card.suit}
    </div>
  );
}

// Generic drop zone
function DropZone({ cards, onDrop, title, canDropCard }) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,

    canDrop: (item) => {
      return canDropCard ? canDropCard(item.card) : true;
    },

    drop: (item, monitor) => {
      if (!monitor.canDrop()) return;
      onDrop(item.card);
    },

    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  const borderColor = isOver
    ? canDrop
      ? "border-green-500 bg-green-100/20"
      : "border-red-500 bg-red-100/20"
    : "border-gray-400";

  return (
    <div className="flex flex-col items-center">
      {title && (
        <div className="text-white mb-1 font-bold">
          {title}
        </div>
      )}

      <div
        ref={drop}
        className={`
          min-h-[100px] min-w-[80px] p-1 flex flex-col items-center
          rounded-lg border-2 border-dashed transition-all
          ${borderColor}
        `}
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
      <div className="min-h-screen bg-sky-500 p-5">
        <h1 className="text-center text-white mb-8 text-2xl font-bold">
          Simple Drag & Drop Solitaire
        </h1>

        <h2 style={{ textAlign: "center", color: "white" }}>Foundations</h2>

        <div className="flex justify-center gap-4 mb-8 flex-wrap">

          {foundations.map((cards, i) => (
            <DropZone
              key={i}
              cards={cards}
              title={`Foundation ${i + 1}`}
              onDrop={(card) => moveToFoundation(card, i)}
              canDropCard={(card) => card.rank === "A"} // 👈 ONLY Aces allowed
            />
          ))}
        </div>

        <h2 className="text-center text-white">Tableau</h2>

        <div className="flex justify-center gap-4 mb-8 flex-wrap">

          {tableau.map((cards, i) => (
            <DropZone
              key={i}
              cards={cards}
              title={`Column ${i + 1}`}
              onDrop={(card) => moveToTableau(card, i)}
            />
          ))}
        </div>

        <h2 className="text-center text-white">Deck / Stock</h2>

        <div className="flex justify-center gap-4">
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