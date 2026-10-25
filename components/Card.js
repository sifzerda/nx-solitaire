// components/Card.js

"use client";

import Image from "next/image";
import { memo, useCallback } from "react";
import useGameStore from "../store/useGameStore";
import usePointerDrag from "./usePointerDrag";
import { CARD_CLASS } from "./cardSizing";

const Card = memo(function Card({ card, stack, index = 0, source }) {
  const { startDrag } = usePointerDrag();
  const id = card?.id;
  // Only the previously hinted and newly hinted cards need to rerender.
  const isHintCard = useGameStore(state => !!id && state.hint?.from?.cardId === id);
  const onPointerDown = useCallback(event => {
    if (!card) return;
    const cards = Array.isArray(stack) && stack.length ? stack.slice(index) : [card];
    startDrag(event, { cards, source });
  }, [startDrag, card, stack, index, source]);

  if (!card) return null;

  return (
    <div onPointerDown={onPointerDown} className={`${CARD_CLASS} relative overflow-hidden ${isHintCard ? "border-4 border-red-500 z-20" : ""}`}>
      <Image src={card.image} alt={card.id} fill draggable={false} sizes="var(--card-width)" className="object-contain pointer-events-none select-none" />
    </div>
  );

});

export default Card;