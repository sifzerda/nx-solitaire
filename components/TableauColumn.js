// components/TableauColumn.js

"use client";

import { memo } from "react";
import useGameStore from "./useGameStore";
import Card from "./Card";
import { CARD_CLASS, CARD_OVERLAP } from "./cardSizing";

const TableauColumn = memo(function TableauColumn({ index }) {
  const cards = useGameStore((s) => s.tableau[index]);

  return (
    <div className="
    relative
    shrink-0
    cursor-grab
  "
      data-dropzone="tableau"
      data-column={index}
      style={{
        contain: "paint",
        width: "var(--card-width)",
        minHeight: "calc(var(--card-height) * 1.2)",
      }}
    >
      <div className="flex flex-col">
        {cards.map((card, idx) => {
          const overlap =
            idx === 0 ? 0 : CARD_OVERLAP;

          if (!card.faceUp) {
            return (
              <div
                key={card.id}
                className={`
                  ${CARD_CLASS}
                  rounded-md
                  border
                  bg-[url('/cards/FDC.png')]
                  bg-cover bg-center"
                `}
                style={{
                  marginTop: overlap,
                }}
              />
            );
          }

          return (
            <div
              key={card.id}
              style={{
                marginTop: overlap,
                zIndex: idx,
              }}
            >
              <Card
                card={card}
                stack={cards}
                index={idx}
                source={{
                  type: "tableau",
                  column: index,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default TableauColumn;