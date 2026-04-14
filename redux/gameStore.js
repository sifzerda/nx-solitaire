"use client";

import { useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useGameStore } from "@/store/gameStore";

const ItemTypes = { CARD: "card" };

/* -------------------- CARD -------------------- */

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

/* -------------------- DROPZONE -------------------- */

function DropZone({ cards, onDrop, title, canDropCard }) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,

    canDrop: (item) => (canDropCard ? canDropCard(item.card) : true),

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
      {title && <div className="text-white mb-1 font-bold">{title}</div>}

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

/* -------------------- MAIN PAGE -------------------- */

export default function Page() {
  const {
    stock,
    tableau,
    foundations,
    initGame,
    moveToFoundation,
    moveToTableau,
    moveToStock,
  } = useGameStore();

  useEffect(() => {
    initGame();
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-sky-500 p-5">

        <h1 className="text-center text-white mb-8 text-2xl font-bold">
          Zustand Solitaire
        </h1>

        {/* FOUNDATIONS */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          {foundations.map((cards, i) => (
            <DropZone
              key={i}
              cards={cards}
              title={`Foundation ${foundationSuits[i]}`}
              onDrop={(card) => moveToFoundation(card, i)}
              canDropCard={(card) => {
                const next = cards.length === 0
                  ? "A"
                  : ranks[ranks.indexOf(cards[cards.length - 1].rank) + 1];

                return (
                  card.suit === foundationSuits[i] &&
                  card.rank === next
                );
              }}
            />
          ))}
        </div>

        {/* TABLEAU */}
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

        {/* STOCK */}
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