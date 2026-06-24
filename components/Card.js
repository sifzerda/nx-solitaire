// components/Card.js

"use client";

import Image from "next/image";
import { memo, useCallback } from "react";
import useGameStore from "./useGameStore";
import usePointerDrag from "./usePointerDrag";
import { CARD_CLASS } from "./cardSizing";

const Card = memo(function Card({ card, stack, index = 0, source }) {
  const { startDrag } = usePointerDrag();

  const hint = useGameStore((s) => s.hint);
  const isHintCard = hint?.from?.cardId === card.id;

  const onPointerDown = useCallback(
    (e) => {
      e.preventDefault(); if (!card) return;

      // SAFE STACK RESOLUTION
      const resolvedStack = Array.isArray(stack) && stack.length > 0 ? stack.slice(index) : [card];
      startDrag(e, { cards: resolvedStack, source });
    },
    [startDrag, card, stack, index, source]
  );

  return (
    <div onPointerDown={onPointerDown} className={
      `${CARD_CLASS}
      relative
      overflow-hidden
       ${isHintCard ? "border-4 border-red-500 z-20" : ""}
  `}>
      <Image
        src={card.image}
        alt={card.id}
        fill
        draggable={false}
        sizes="var(--card-width)"
        className="
          object-contain
          pointer-events-none
          select-none
        "
      /></div>
  );
});

export default Card;