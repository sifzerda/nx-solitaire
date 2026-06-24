// stores/useGameStore.js

import { create } from "zustand";

const suits = ["♠", "♥", "♦", "♣"];
const RED_SUITS = new Set(["♥", "♦"]);

function isRed(suit) {
  return RED_SUITS.has(suit);
}

const rankValue = { A: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, J: 11, Q: 12, K: 13 };

//hint system helper
const createSnapshot = (state) => ({
  stock: [...state.stock],
  stockIndex: state.stockIndex,
  tableau: state.tableau.map((p) => [...p]),
  foundations: state.foundations.map((p) => [...p]),
});

/* -------------------- STORE -------------------- */

const useGameStore = create((set, get) => ({
  stock: [],
  stockIndex: 0,
  tableau: [[], [], [], [], [], [], []],
  foundations: [[], [], [], []],
  draggingIds: [],

  /* ---------------- HISTORY (UNDO / REDO) ---------------- */
  history: [],
  future: [],
  hint: null,


  /* ---------------- INIT ---------------- */


  initializeGame: (game) => {
    set({
      ...game,
      stockIndex: game.stock.length - 1,
      history: [],
      future: [],
      hint: null,
    });
  },

  /* ---------------- STOCK ---------------- */

  nextStockCard: () => {
    const state = get();

    if (state.stock.length === 0) return;

    set({
      history: [...state.history, createSnapshot(state)],
      future: [],
    });

    set((state) => {
      const nextIndex = state.stockIndex - 1;

      return {
        stockIndex: nextIndex >= 0 ? nextIndex : 0,
      };
    });
  },

  resetStockCycle: () => {
    const state = get();

    set({
      history: [...state.history, createSnapshot(state)],
      future: [],
    });

    set((state) => ({
      stockIndex: state.stock.length - 1,
    }));
  },

  /* ---------------- TABLEAU HELPERS ---------------- */

  flipTopTableauCard: (colIndex) => {
    set((state) => {
      const tableau = [...state.tableau];
      const pile = [...tableau[colIndex]];

      if (!pile.length) return state;

      const top = pile[pile.length - 1];

      if (!top.faceUp) {
        pile[pile.length - 1] = {
          ...top,
          faceUp: true,
        };
      }

      tableau[colIndex] = pile;

      return { tableau };
    });
  },

  removeCardFromAll: (id) => {
    set((state) => ({
      stock: state.stock.filter((c) => c.id !== id),
      tableau: state.tableau.map((p) => p.filter((c) => c.id !== id)),
      foundations: state.foundations.map((p) => p.filter((c) => c.id !== id)),
    }));
  },

  /* ---------------- VALIDATION ---------------- */

  canPlaceOnTableau: (card, col) => {
    const pile = get().tableau[col];
    const top = pile[pile.length - 1];

    if (!top) return card.rank === "K";

    return (
      isRed(card.suit) !== isRed(top.suit) &&
      rankValue[card.rank] === rankValue[top.rank] - 1
    );
  },

  canPlaceOnFoundation: (card, index) => {
    const pile = get().foundations[index];
    const top = pile[pile.length - 1];

    if (!top) {
      return card.rank === "A" && card.suit === suits[index];
    }
    return (
      card.suit === top.suit && rankValue[card.rank] === rankValue[top.rank] + 1
    );
  },

  /* ---------------- CORE MOVE ENGINE ---------------- */

  moveCards: ({ cards, from, to }) => {
    if (!cards?.length) return;

    const state = get();
    const first = cards[0];

    /* ---------------- SAVE HISTORY (IMPORTANT) ---------------- */
    const snapshot = createSnapshot(state);

    // helper — only call after validation passes
    const saveHistory = () =>
      set({ history: [...get().history, snapshot], future: [] });

    /* ---------------- TABLEAU → TABLEAU ---------------- */
    if (from.type === "tableau" && to.type === "tableau") {
      if (!state.canPlaceOnTableau(first, to.column)) return;

      saveHistory();

      set((state) => {
        const tableau = [...state.tableau];

        tableau[from.column] = tableau[from.column].slice(0, tableau[from.column].length - cards.length);

        tableau[to.column] = [
          ...tableau[to.column],
          ...cards,
        ];

        return { tableau };
      });

      return;
    }

    /* ---------------- TABLEAU → FOUNDATION ---------------- */
    if (from.type === "tableau" && to.type === "foundation") {

      const sourcePile = state.tableau[from.column];
      const topCard = sourcePile[sourcePile.length - 1];

      // ONLY allow the top tableau card
      if (cards.length !== 1 || !topCard || topCard.id !== first.id) {
        return;
      }

      if (!state.canPlaceOnFoundation(first, to.foundation)) return;

      saveHistory();

      set((state) => {
        const tableau = state.tableau.map((pile, i) => {
          if (i !== from.column) return pile;

          const updated = pile.slice(0, -1);
          return updated;
        });

        const foundations = state.foundations.map((pile, i) => i === to.foundation ? [...pile, first] : pile
        );

        return { tableau, foundations };
      });

      return;
    }

    /* ---------------- WASTE → TABLEAU ---------------- */
    if (
      from.type === "waste" && to.type === "tableau"
    ) {
      if (!state.canPlaceOnTableau(first, to.column)) return;
      saveHistory(); // 
      set((state) => {
        const tableau = [...state.tableau];

        tableau[to.column] = [
          ...tableau[to.column],
          first,
        ];

        const stock = state.stock.filter((c) => c.id !== first.id);

        return { tableau, stock };
      });

      return;
    }


    if (from.type === "waste" && to.type === "foundation") {
      if (!state.canPlaceOnFoundation(first, to.foundation)) return;
      saveHistory();

      set((state) => {
        const foundations = state.foundations.map((pile, i) => i === to.foundation ? [...pile, first] : pile
        );
        const stock = state.stock.filter((c) => c.id !== first.id);
        return { foundations, stock };
      });
      return;
    }
  },

  findHint: () => {
    const state = get();

    /* ---------------- TABLEAU -> FOUNDATION ---------------- */

    for (let col = 0; col < 7; col++) {
      const pile = state.tableau[col];

      if (!pile.length) continue;

      const card = pile[pile.length - 1];

      if (!card.faceUp) continue;

      for (let foundation = 0; foundation < 4; foundation++) {
        if (state.canPlaceOnFoundation(card, foundation)) {
          return {
            from: {
              type: "tableau",
              column: col,
              cardId: card.id,
            },
            to: {
              type: "foundation",
              foundation,
            },
          };
        }
      }
    }

    /* ---------------- WASTE -> FOUNDATION ---------------- */

    const waste = state.stock[state.stockIndex];

    if (waste) {
      for (let foundation = 0; foundation < 4; foundation++) {
        if (state.canPlaceOnFoundation(waste, foundation)) {
          return {
            from: {
              type: "waste",
              cardId: waste.id,
            },
            to: {
              type: "foundation",
              foundation,
            },
          };
        }
      }
    }

    /* ---------------- TABLEAU -> TABLEAU ---------------- */

    for (let fromCol = 0; fromCol < 7; fromCol++) {
      const pile = state.tableau[fromCol];

      for (let i = 0; i < pile.length; i++) {
        const card = pile[i];

        if (!card.faceUp) continue;

        for (let toCol = 0; toCol < 7; toCol++) {
          if (toCol === fromCol) continue;

          if (state.canPlaceOnTableau(card, toCol)) {
            return {
              from: {
                type: "tableau",
                column: fromCol,
                cardId: card.id,
              },
              to: {
                type: "tableau",
                column: toCol,
              },
            };
          }
        }
      }
    }

    /* ---------------- WASTE -> TABLEAU ---------------- */

    if (waste) {
      for (let col = 0; col < 7; col++) {
        if (state.canPlaceOnTableau(waste, col)) {
          return {
            from: {
              type: "waste",
              cardId: waste.id,
            },
            to: {
              type: "tableau",
              column: col,
            },
          };
        }
      }
    }

    return null;
  },

  showHint: () => {
    const hint = get().findHint();

    if (!hint) return;

    set({ hint });

    setTimeout(() => {
      if (get().hint === hint) {
        set({ hint: null });
      }
    }, 1500);
  },

  setDraggingIds: (ids) => set({ draggingIds: ids }),
  clearDraggingIds: () => set({ draggingIds: [] }),

  /* ---------------- UNDO ---------------- */

  undo: () => {
    const state = get();

    if (state.history.length === 0) return;

    const previous = state.history[state.history.length - 1];

    const future = [
      createSnapshot(state),
      ...state.future,
    ];

    set({
      ...previous,
      history: state.history.slice(0, -1),
      future,
    });
  },

  setHint: (hint) => set({ hint }),
  clearHint: () => set({ hint: null }),

  /* ---------------- REDO ---------------- */

  redo: () => {
    const state = get();

    if (state.future.length === 0) return;

    const next = state.future[0];

    const history = [
      ...state.history,
      createSnapshot(state),
    ];

    set({
      ...next,
      history,
      future: state.future.slice(1),
    });
  },
}));

export default useGameStore;