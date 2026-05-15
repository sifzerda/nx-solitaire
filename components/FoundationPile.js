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

    <div data-dropzone="foundation" data-foundation={index} className={`
  ${CARD_SIZE}
  relative
  rounded-md
  border-2 border-dashed border-white/40

  flex items-center justify-center
  overflow-hidden
  touch-none
`}>
      {topCard ? (
        <div className="absolute inset-0" style={{ pointerEvents: "none" }}>
          <img src={topCard.image} alt={topCard.id} draggable={false}
            className="w-full h-full object-cover rounded-md" />
        </div>
      ) : (
        <div className="
  text-lg
  sm:text-2xl
  md:text-3xl

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