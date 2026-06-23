// components/Card.js

"use client";

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
       ${isHintCard ? "ring-4 ring-red-500" : "" }
  `}>
      <img src={card.image} alt={card.id} draggable={false} className="w-full h-full object-contain pointer-events-none" /></div>
  );
});

export default Card;