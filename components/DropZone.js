"use client";

import { useEffect } from "react";
import { memo } from "react";
import { useDrop, useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

import useGameStore from "./useGameStore";

const ItemTypes = {
    CARD: "card",
};

const CARD_WIDTH = `w-15 sm:w-18 md:w-22 lg:w-28`;
const CARD_HEIGHT = `h-24 sm:h-26 md:h-30 lg:h-40`;
const CARD_TEXT = `text-md sm:text-md md:text-base lg:text-lg`;

const rankValue = (rank) =>
({
    A: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    10: 10,
    J: 11,
    Q: 12,
    K: 13,
}[rank]);

const isRed = (suit) =>
    suit === "♥" || suit === "♦";

function isValidStack(stack) {
    for (let i = 0; i < stack.length - 1; i++) {
        const current = stack[i];
        const next = stack[i + 1];

        const oppositeColor =
            isRed(current.suit) !== isRed(next.suit);

        const correctOrder =
            rankValue(current.rank) ===
            rankValue(next.rank) + 1;

        if (!oppositeColor || !correctOrder) {
            return false;
        }
    }

    return true;
}

/* ---------------- CARD ---------------- */

const Card = memo(function Card({
    card,
    columnIndex,
    cardIndex,
}) {
    const [{ isDragging }, drag, preview] = useDrag(() => ({
        type: ItemTypes.CARD,

        canDrag: () => {
            if (
                columnIndex === undefined ||
                columnIndex === -1
            ) {
                return true;
            }

            const state = useGameStore.getState();

            const column =
                state.tableau[columnIndex];

            if (!column) return false;

            const rawStack = column.slice(cardIndex);

            const stack = rawStack.filter(
                (c) => c.faceUp
            );

            return isValidStack(stack);
        },

        item: () => {
            if (
                columnIndex === undefined ||
                columnIndex === -1
            ) {
                return {
                    cards: [card],
                    fromColumn: columnIndex ?? null,
                };
            }

            const state = useGameStore.getState();

            const column =
                state.tableau[columnIndex];

            const stack = column
                .slice(cardIndex)
                .filter((c) => c.faceUp);

            return {
                cards: stack,
                fromColumn: columnIndex,
            };
        },

        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    useEffect(() => {
        preview(getEmptyImage(), {
            captureDraggingState: true,
        });
    }, [preview]);

    return (
        <div
            ref={drag}
            className={`
        ${CARD_WIDTH}
        ${CARD_HEIGHT}
        ${CARD_TEXT}
        transform-gpu
        will-change-transform
        flex items-center justify-center
        rounded-md
        border border-black
        bg-white
        font-bold
        cursor-grab
        ${isDragging ? "opacity-0" : "opacity-100"}
      `}
        >
            <img
                src={card.image}
                alt={`${card.rank}${card.suit}`}
                draggable={false}
                className="w-full h-full object-contain rounded-md pointer-events-none"
            />
        </div>
    );
});

/* ---------------- DROPZONE ---------------- */

const DropZone = memo(function DropZone({
    cards,
    onDrop,
    canDropCard,
    columnIndex,
    suit,
}) {
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: ItemTypes.CARD,

        canDrop: (item) => {
            if (!canDropCard) return true;

            const firstCard = item.cards[0];

            return canDropCard(firstCard);
        },

        drop: (item) =>
            onDrop(item.cards, item.fromColumn),

        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop(),
        }),
    }));

    const pileHeight =
        cards.length <= 1
            ? 100
            : 100 + (cards.length - 1) * 28;

    return (
        <div className="flex flex-col items-center shrink-0">
            <div
                ref={drop}
                className={`
          ${CARD_WIDTH}
          ${CARD_HEIGHT}
          rounded-md
          border-2 border-dashed
          bg-green-500
          relative
          transition-colors
          ${isOver
                        ? canDrop
                            ? "border-green-300 bg-green-800/50"
                            : "border-red-500 bg-red-500/50"
                        : "border-green-600"
                    }
        `}
                style={{
                    minHeight: `${pileHeight}px`,
                }}
            >
                {/* EMPTY FOUNDATION SUIT */}
                {cards.length === 0 && suit && (
                    <div
                        className={`
              absolute inset-0
              flex items-center justify-center
              text-xl sm:text-2xl md:text-3xl
              pointer-events-none
              ${suit === "♥" || suit === "♦"
                                ? "text-red-500"
                                : "text-blue-500"
                            }
              opacity-90
            `}
                    >
                        {suit}
                    </div>
                )}

                {/* CARDS */}
                {cards.map((card, idx) => {
                    const isFaceUp = card.faceUp;

                    const isTop =
                        idx === cards.length - 1;

                    return (
                        <div
                            key={card.id}
                            className="absolute left-1/2"
                            style={{
                                top: `calc(${idx} * var(--card-offset))`,
                                zIndex: idx,
                                transform: "translateX(-50%)",
                            }}
                        >
                            {isFaceUp ? (
                                <Card
                                    card={card}
                                    columnIndex={columnIndex}
                                    cardIndex={idx}
                                />
                            ) : (
                                <div
                                    onClick={() => {
                                        if (isTop && !card.faceUp) {
                                            useGameStore
                                                .getState()
                                                .flipTopTableauCard(
                                                    columnIndex
                                                );
                                        }
                                    }}
                                    className={`
                    ${CARD_WIDTH}
                    ${CARD_HEIGHT}
                    rounded-md
                    overflow-hidden
                    shrink-0
                    ${isTop && !card.faceUp
                                            ? "cursor-pointer"
                                            : "cursor-default"
                                        }
                  `}
                                >
                                    <div className="w-full h-full rounded-md bg-[url('/cards/FDC.png')] bg-cover bg-center" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

export default DropZone;