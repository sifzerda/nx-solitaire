// components/TableauColumn.js

"use client";

import { memo } from "react";
import useGameStore from "./useGameStore";
import Card from "./Card";
import { CARD_SIZE } from "./cardSizing";

const TableauColumn = memo(function TableauColumn({ index }) {
  const cards = useGameStore((s) => s.tableau[index]);

  return (
    <div
      className={`
        relative
        flex-1
        min-w-0
        min-h-22
        cursor-grab
      `}
      data-dropzone="tableau"
      data-column={index}
      style={{ contain: "paint" }}
    >
      <div className="flex flex-col">
        {cards.map((card, idx) => {
          const overlap =
            idx === 0 ? 0 : "var(--card-overlap)";

          if (!card.faceUp) {
            return (
              <div
                key={card.id}
                className={`
                  ${CARD_SIZE}
                  rounded-md
                  bg-green-800
                  border
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