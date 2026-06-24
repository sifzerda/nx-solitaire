// components/FoundationPile.js

"use client";

import Image from "next/image";
import { memo } from "react";
import useGameStore from "./useGameStore";
import { CARD_CLASS } from "./cardSizing";

const suits = ["♠", "♥", "♦", "♣"];
const getSuitColor = (suit) => {
  if (suit === "♥" || suit === "♦") return "text-red-500";
  return "text-blue-400";
};

const FoundationPile = memo(function FoundationPile({ index }) {
  const cards = useGameStore((s) => s.foundations[index]);
  const hint = useGameStore((s) => s.hint);
  const isHintTarget = hint?.to?.type === "foundation" && hint.to.foundation === index;
  const topCard = cards[cards.length - 1];

  return (
    <div data-dropzone="foundation" data-foundation={index}

      className={`${CARD_CLASS} 
      relative rounded-xs border-4 border-double border-green-600 flex items-center justify-center overflow-hidden touch-none 
      ${isHintTarget ? "outline-4 outline-red 500" : ""}`}>

      {topCard ? (
        <div className="absolute inset-0"
          style={{ pointerEvents: "none" }}>
          <div className="absolute inset-0">
            <Image
              src={topCard.image}
              alt={topCard.id}
              fill
              draggable={false}
              sizes="var(--card-width)"
              className="object-cover rounded-xs pointer-events-none"
            />
          </div>
        </div>
      ) : (
        <div
          className={`text-5xl sm:text-6xl md:text-7xl font-bold
    ${getSuitColor(suits[index])}`}>
          {suits[index]}
        </div>
      )}
    </div>
  );
});

export default FoundationPile;