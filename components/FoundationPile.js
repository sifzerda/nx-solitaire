// components/FoundationPile.js

"use client";

import { memo, useCallback } from "react";

import useGameStore from "./useGameStore";
import DropZone from "./DropZone";

const suits = ["♠", "♥", "♦", "♣"];

const FoundationPile = memo(function FoundationPile({ index }) {
const cards = useGameStore(
  (s) => s.foundations[index]
);

    const moveToFoundation = useGameStore(
        (s) => s.moveToFoundation
    );

    const canPlaceOnFoundation = useGameStore(
        (s) => s.canPlaceOnFoundation
    );

    const onDrop = useCallback(
        (cards) => {
            moveToFoundation(cards[0], index);
        },
        [moveToFoundation, index]
    );

    const canDropCard = useCallback(
        (card) => canPlaceOnFoundation(card, index),
        [canPlaceOnFoundation, index]
    );

    return (
        <DropZone
            cards={cards.length ? [cards[cards.length - 1]] : []}
            columnIndex={index}
            suit={suits[index]}
            onDrop={onDrop}
            canDropCard={canDropCard}
        />
    );
});

export default FoundationPile;