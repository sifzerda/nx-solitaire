// components/TableauColumn.js

"use client";

import { memo, useCallback } from "react";
import useGameStore from "./useGameStore";
import DropZone from "./DropZone";

const TableauColumn = memo(function TableauColumn({ index }) {
const cards = useGameStore(
  useCallback(
    (state) => state.tableau[index],
    [index]
  )
);

  const moveStackToTableau = useGameStore(
    (s) => s.moveStackToTableau
  );

  const canPlaceOnTableau = useGameStore(
    (s) => s.canPlaceOnTableau
  );

  const onDrop = useCallback(
    (cards, fromColumn) => {
      moveStackToTableau(cards, fromColumn, index);
    },
    [moveStackToTableau, index]
  );

  const canDropCard = useCallback(
    (card) => canPlaceOnTableau(card, index),
    [canPlaceOnTableau, index]
  );

  return (
    <DropZone
      cards={cards}
      columnIndex={index}
      onDrop={onDrop}
      canDropCard={canDropCard}
    />
  );
});

export default TableauColumn;