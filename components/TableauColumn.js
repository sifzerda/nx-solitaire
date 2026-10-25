// components/TableauColumn.js

"use client";

import { memo, useMemo } from "react";
import useGameStore from "../store/useGameStore";
import Card from "./Card";
import { CARD_CLASS, CARD_OVERLAP } from "./cardSizing";

const TableauColumn = memo(function TableauColumn({ index }) {
  const cards = useGameStore(state => state.tableau[index]);
  // Each column subscribes only to the first hidden card's index in that column.
  const draggingStart = useGameStore(state => state.draggingIds.length ? state.tableau[index].findIndex(card => card.id === state.draggingIds[0]) : -1);
  const isHintTarget = useGameStore(state => state.hint?.to?.type === "tableau" && state.hint.to.column === index);
  const flip = useGameStore(state => state.flipTopTableauCard);
  const source = useMemo(() => ({ type: "tableau", column: index }), [index]);
  const visibleLength = draggingStart < 0 ? cards.length : draggingStart;

  return (
    <div className={`relative shrink-0 cursor-grab ${isHintTarget ? "outline-4 outline-red-500" : ""}`}
      data-dropzone="tableau" data-column={index}
      style={{ contain: "paint", width: "var(--card-width)", minHeight: "calc(var(--card-height) * 1.2)" }}>
      <div className="flex flex-col">
        {cards.map((card, cardIndex) => {
          if (cardIndex >= visibleLength) return null;
          const marginTop = cardIndex ? CARD_OVERLAP : 0;
          if (!card.faceUp) {
            // Only the actual top card is clickable, never a card exposed by a drag.
            const canFlip = cardIndex === cards.length - 1;
            return (
              <div key={card.id} className={`${CARD_CLASS} rounded-xs border overflow-hidden`}
                style={{ marginTop }} onClick={canFlip ? () => flip(index) : undefined}>
                <div className="w-full h-full rounded-xs bg-[url('/cards/FDC.png')] bg-cover bg-center" />
              </div>
            );
          }
          return (
            <div key={card.id} style={{ marginTop, zIndex: cardIndex }}>
              <Card card={card} stack={cards} index={cardIndex} source={source} />
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default TableauColumn;
