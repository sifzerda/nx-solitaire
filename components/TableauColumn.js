// components/TableauColumn.js

"use client";

import { memo } from "react";
import useGameStore from "./useGameStore";
import Card from "./Card";

const TableauColumn = memo(function TableauColumn({ index }) {
  const cards = useGameStore((s) => s.tableau[index]);

  return (
    <div
  className="relative min-w-20 min-h-24 sm:min-h-26 md:min-h-30 lg:min-h-40"
  data-dropzone="tableau"
      data-column={index}
      style={{ contain: "paint" }}
    >
      <div className="flex flex-col">
        {cards.map((card, idx) => {
          if (!card.faceUp) {
            return (
              <div
                key={card.id}
                className="w-15 h-24 rounded-md bg-green-800 border"
                style={{
                  marginTop: idx === 0 ? 0 : "-60px",
                }}
              />
            );
          }

          return (
            <div
              key={card.id}
              style={{
                marginTop: idx === 0 ? 0 : "-60px",
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