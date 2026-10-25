// components/FoundationPile.js

"use client";

import Image from "next/image";
import { memo } from "react";
import useGameStore from "../store/useGameStore";
import { CARD_CLASS } from "./cardSizing";

const SUITS = ["♠", "♥", "♦", "♣"];

const FoundationPile = memo(function FoundationPile({ index }) {
  const topCard = useGameStore(state => {
    const pile = state.foundations[index];
    return pile[pile.length - 1];
  });

  const isHintTarget = useGameStore(state => state.hint?.to?.type === "foundation" && state.hint.to.foundation === index);
  
  return (
    <div data-dropzone="foundation" data-foundation={index}
      className={`${CARD_CLASS} relative rounded-xs border-4 border-double border-green-600 flex items-center justify-center overflow-hidden touch-none ${isHintTarget ? "outline-4 outline-red-500" : ""}`}>
      {topCard ? (
        <Image src={topCard.image} alt={topCard.id} fill draggable={false} sizes="var(--card-width)" className="object-cover rounded-xs pointer-events-none" />
      ) : (
        <div className={`text-5xl sm:text-6xl md:text-7xl font-bold ${index === 1 || index === 2 ? "text-red-500" : "text-blue-400"}`}>{SUITS[index]}</div>
      )}
    </div>
  );
});

export default FoundationPile;
