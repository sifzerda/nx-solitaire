"use client";

import { useDispatch, useSelector } from "react-redux";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import {
  moveToFoundation,
  moveToTableau,
  moveToStock,
} from "../redux/gameSlice.js";

const ItemTypes = { CARD: "card" };

// CARD (unchanged)
function Card({ card }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: { card },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`w-[60px] h-[80px] m-1 flex items-center justify-center
      border bg-white font-bold shadow cursor-grab
      ${card.suit === "♥" || card.suit === "♦" ? "text-red-500" : "text-black"}
      ${isDragging ? "opacity-50" : "opacity-100"}`}
    >
      {card.rank}
      {card.suit}
    </div>
  );
}

// DROPZONE (unchanged except no local state)
function DropZone({ cards, onDrop, title, canDropCard }) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    canDrop: (item) => (canDropCard ? canDropCard(item.card) : true),
    drop: (item, monitor) => {
      if (!monitor.canDrop()) return;
      onDrop(item.card);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  return (
    <div className="flex flex-col items-center">
      <div ref={drop} className="min-h-[100px] min-w-[80px] border p-2">
        {cards.map((c) => (
          <Card key={c.id} card={c} />
        ))}
      </div>
      <div className="text-white text-sm">{title}</div>
    </div>
  );
}

// MAIN GAME
export default function Game() {
  const dispatch = useDispatch();

  const { stock, tableau, foundations } = useSelector(
    (state) => state.game
  );

  const suits = ["♠", "♥", "♦", "♣"];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-sky-500 p-5">

        <h1 className="text-white text-center text-2xl mb-6">
          Redux Solitaire
        </h1>

        {/* Foundations */}
        <div className="flex justify-center gap-4 mb-6">
          {foundations.map((cards, i) => (
            <DropZone
              key={i}
              cards={cards}
              title={`Foundation ${suits[i]}`}
              onDrop={(card) =>
                dispatch(moveToFoundation({ card, index: i }))
              }
              canDropCard={(card) => card.suit === suits[i]}
            />
          ))}
        </div>

        {/* Tableau */}
        <div className="flex justify-center gap-4 mb-6">
          {tableau.map((cards, i) => (
            <DropZone
              key={i}
              cards={cards}
              title={`Column ${i + 1}`}
              onDrop={(card) =>
                dispatch(moveToTableau({ card, index: i }))
              }
            />
          ))}
        </div>

        {/* Stock */}
        <div className="flex justify-center">
          <DropZone
            cards={stock}
            title="Stock"
            onDrop={(card) => dispatch(moveToStock(card))}
          />
        </div>
      </div>
    </DndProvider>
  );
}