// components/Card.js

"use client";

import { memo, useCallback } from "react";
import usePointerDrag from "./usePointerDrag";
import { CARD_SIZE } from "./cardSizing";

const Card = memo(function Card({ card, stack, index = 0, source }) {
  const { startDrag } = usePointerDrag();

  const onPointerDown = useCallback(
    (e) => {
      e.preventDefault();
      if (!card) return;

      // SAFE STACK RESOLUTION
      const resolvedStack = Array.isArray(stack) && stack.length > 0 ? stack.slice(index) : [card];
      startDrag(e, { cards: resolvedStack, source });
    },
    [startDrag, card, stack, index, source]
  );

  return (
    <div
      onPointerDown={onPointerDown}
      className={`
    ${CARD_SIZE}
  `}>
      <img src={card.image} alt={card.id} draggable={false} className=
        "w-full h-full object-cover pointer-events-none" />
    </div>
  );
});

export default Card;