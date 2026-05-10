// components/FoundationPile.js

"use client";

import { memo } from "react";
import useGameStore from "./useGameStore";

const suits = ["♠", "♥", "♦", "♣"];

const FoundationPile = memo(function FoundationPile({ index }) {
  const cards = useGameStore((s) => s.foundations[index]);
  const topCard = cards[cards.length - 1];

  return (
    <div
      data-dropzone="foundation"
      data-foundation={index}
      className="
        relative
        w-15 sm:w-18 md:w-22 lg:w-28
        h-24 sm:h-26 md:h-30 lg:h-40
        rounded-md
        border-2 border-dashed border-white/40
        flex items-center justify-center
        overflow-hidden
        touch-none
      "
    >
      {topCard ? (
        <div className="absolute inset-0" style={{ pointerEvents: "none" }}>
          <img
            src={topCard.image}
            alt={topCard.id}
            draggable={false}
            className="w-full h-full object-cover rounded-md"
          />
        </div>
      ) : (
        <div className="text-3xl text-white/50 font-bold">
          {suits[index]}
        </div>
      )}
    </div>
  );
});

export default FoundationPile;