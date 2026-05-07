// stores/useGameStore.js

import { create } from "zustand";

/* -------------------- STORE -------------------- */

const useGameStore = create((set, get) => ({
  stock: [],
  stockIndex: 0,
  tableau: [],
  foundations: [],

  initializeGame: (game) => {
    set({ ...game, stockIndex: game.stock.length - 1 });
  },

  nextStockCard: () => {
    set((state) => {
      if (state.stock.length === 0) return state;
      const nextIndex = state.stockIndex - 1;
      return {
        stockIndex: nextIndex >= 0 ? nextIndex : 0,
      };
    });
  },

  resetStockCycle: () => {
    set((state) => ({
      stockIndex: state.stock.length - 1,
    }));
  },

  flipTopTableauCard: (colIndex) => {
    set((state) => {
      const next = [...state.tableau];
      const pile = [...next[colIndex]];
      if (pile.length === 0) return state;

      const topIndex = pile.length - 1;

      if (!pile[topIndex].faceUp) {
        pile[topIndex] = {
          ...pile[topIndex],
          faceUp: true,
        };
      }

      next[colIndex] = pile;
      return { tableau: next };
    });
  },

  removeCardFromAll: (cardId) => {
    set((state) => ({
      stock: state.stock.filter((c) => c.id !== cardId),
      tableau: state.tableau.map((pile) =>
        pile.filter((c) => c.id !== cardId)
      ),
      foundations: state.foundations.map((pile) =>
        pile.filter((c) => c.id !== cardId)
      ),
    }));
  },

  canPlaceOnFoundation: (card, index) => {
    const suits = ["♠", "♥", "♦", "♣"];

    const rankValue = (rank) =>
      ({
        A: 1,2: 2,3: 3,4: 4,5: 5,6: 6,7: 7,
        8: 8,9: 9,10: 10,J: 11,Q: 12,K: 13,
      }[rank]);

    const pile = get().foundations[index];
    const topCard = pile[pile.length - 1];

    if (card.suit !== suits[index]) return false;
    if (!topCard) return card.rank === "A";

    return rankValue(card.rank) === rankValue(topCard.rank) + 1;
  },

  moveToFoundation: (card, index) => {
    if (!get().canPlaceOnFoundation(card, index)) return;

    get().removeCardFromAll(card.id);

    set((state) => {
      const next = [...state.foundations];
      next[index] = [...next[index], card];
      return { foundations: next };
    });
  },

  canPlaceOnTableau: (card, index) => {
    const state = get();
    const pile = state.tableau[index];
    const bottomCard = pile[pile.length - 1];

    const isRed = (s) => s === "♥" || s === "♦";
    const rankValue = (r) =>
      ({
        A: 1,2: 2,3: 3,4: 4,5: 5,6: 6,7: 7,
        8: 8,9: 9,10: 10,J: 11,Q: 12,K: 13,
      }[r]);

    if (!bottomCard) return card.rank === "K";

    return (
      isRed(card.suit) !== isRed(bottomCard.suit) &&
      rankValue(card.rank) === rankValue(bottomCard.rank) - 1
    );
  },

  moveStackToTableau: (cards, fromColumn, toColumn) => {
    const first = cards[0];

    if (!get().canPlaceOnTableau(first, toColumn)) return;

    set((state) => {
      const tableau = [...state.tableau];

      if (fromColumn !== null && fromColumn !== undefined) {
        tableau[fromColumn] = tableau[fromColumn].slice(
          0,
          tableau[fromColumn].length - cards.length
        );
      }

      tableau[toColumn] = [
        ...tableau[toColumn],
        ...cards.map((c) => ({ ...c, faceUp: true })),
      ];

      return { tableau };
    });

    if (fromColumn !== null && fromColumn !== undefined) {
      get().flipTopTableauCard(fromColumn);
    }
  },

  moveToStock: (card) => {
    get().removeCardFromAll(card.id);

    set((state) => ({
      stock: [...state.stock, card],
    }));
  },
}));

export default useGameStore;