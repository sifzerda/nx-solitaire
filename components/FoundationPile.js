// components/FoundationPile.js

"use client";

import { memo } from "react";
import useGameStore from "./useGameStore";
import { CARD_SIZE } from "./cardSizing";

const suits = ["♠", "♥", "♦", "♣"];

const FoundationPile = memo(function FoundationPile({ index }) {
  const cards = useGameStore((s) => s.foundations[index]);
  const topCard = cards[cards.length - 1];

  return (

    <div data-dropzone="foundation" data-foundation={index} className="
  w-16 h-24
  sm:w-18 sm:h-32
  md:w-22 md:h-40
  lg:w-26 lg:h-44

  relative
  rounded-md
  border-2 border-dashed border-white/40

  flex items-center justify-center
  overflow-hidden
  touch-none
">

      {topCard ? (
        <div className="absolute inset-0" style={{ pointerEvents: "none" }}>
          <img src={topCard.image} alt={topCard.id} draggable={false}
            className="w-full h-full object-cover rounded-md" />
        </div>
      ) : (
        <div className="
  text-5xl
  sm:text-6xl
  md:text-7xl

  text-white/50
  font-bold
">
          {suits[index]}
        </div>
      )}
    </div>
  );
});

export default FoundationPile;