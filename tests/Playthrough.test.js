// GamePlaythrough.test.js
// tests game can play

import useGameStore from "../components/useGameStore";

const suits = ["♠", "♥", "♦", "♣"];
const ranks = [ "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K" ];

describe("Solitaire full-game simulation", () => {
  it("legally moves all 52 cards to the foundations and wins", () => {
    const tableau = Array.from({ length: 7 }, () => []);

    // Set up a deterministic, solvable game.
    // Each column reveals A, 2, 3 ... K as cards are removed.
    suits.forEach((suit, column) => {
      tableau[column] = [...ranks].reverse().map((rank) => ({
        suit,
        rank,
        id: `${rank}${suit}`,
        faceUp: true,
      }));
    });

    useGameStore.getState().initializeGame({
      stock: [],
      tableau,
      foundations: [[], [], [], []],
    });

    // Simulate playing every card legally onto its foundation.
    for (let rankIndex = 0; rankIndex < 13; rankIndex++) {
      for (let suitIndex = 0; suitIndex < 4; suitIndex++) {
        const state = useGameStore.getState();
        const card = state.tableau[suitIndex].at(-1);

        expect(card).toBeDefined();
        expect(card.rank).toBe(ranks[rankIndex]);
        expect(card.suit).toBe(suits[suitIndex]);
        expect(
          state.canPlaceOnFoundation(card, suitIndex)
        ).toBe(true);

        state.moveCards({
          cards: [card],
          from: {
            type: "tableau",
            column: suitIndex,
          },
          to: {
            type: "foundation",
            foundation: suitIndex,
          },
        });

        expect(
          useGameStore.getState().foundations[suitIndex].at(-1).id
        ).toBe(card.id);
      }
    }

    const finalState = useGameStore.getState();

    // All four foundations must contain 13 cards.
    expect(finalState.foundations.map((pile) => pile.length)).toEqual([
      13, 13, 13, 13,
    ]);

    // Every card must be accounted for exactly once.
    const allCards = finalState.foundations.flat();

    expect(allCards).toHaveLength(52);
    expect(new Set(allCards.map((card) => card.id)).size).toBe(52);

    // Every foundation must contain the correct suit in order.
    finalState.foundations.forEach((pile, suitIndex) => {
      expect(pile.map((card) => card.rank)).toEqual(ranks);
      expect(pile.every((card) => card.suit === suits[suitIndex])).toBe(true);
    });

    // The game-winning condition used by Solitaire.js.
    expect(
      finalState.foundations.every((pile) => pile.length === 13)
    ).toBe(true);
  });
});