// components/Card.js

"use client";

import { memo, useCallback } from "react";
import usePointerDrag from "./usePointerDrag";

const Card = memo(function Card({ card, stack, index = 0, source }) {
  const { startDrag } = usePointerDrag();

  const onPointerDown = useCallback(
     (e) => { e.preventDefault();
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
      className="
        w-15 sm:w-18 md:w-22 lg:w-28
        h-24 sm:h-26 md:h-30 lg:h-40
        rounded-md
        overflow-hidden
        touch-none
        cursor-grab
        select-none">
      <img src={card.image} alt={card.id} draggable={false} className=
      "w-full h-full object-cover pointer-events-none" />
    </div>
  );
});

export default Card;