// stores/useGameStore.js

import { create } from "zustand";

const suits = ["♠", "♥", "♦", "♣"];
const RED_SUITS = new Set(["♥", "♦"]);

function isRed(suit) {
  return RED_SUITS.has(suit);
}

const rankValue = {
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
};

/* -------------------- STORE -------------------- */

const useGameStore = create((set, get) => ({
  stock: [],
  stockIndex: 0,
  tableau: [[], [], [], [], [], [], []],
  foundations: [[], [], [], []],

  /* ---------------- HISTORY (UNDO / REDO) ---------------- */
  history: [],
  future: [],

  /* ---------------- SNAPSHOT ---------------- */

  snapshot: (state) => ({
    stock: state.stock,
    stockIndex: state.stockIndex,
    tableau: state.tableau.map((p) => [...p]),
    foundations: state.foundations.map((p) => [...p]),
  }),

  /* ---------------- INIT ---------------- */

  initializeGame: (game) => {
    set({
      ...game,
      stockIndex: game.stock.length - 1,
      history: [],
      future: [],
    });
  },

  /* ---------------- STOCK ---------------- */

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
      tableau: state.tableau.map((p) =>
        p.filter((c) => c.id !== id)
      ),
      foundations: state.foundations.map((p) =>
        p.filter((c) => c.id !== id)
      ),
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

    console.group("🏛 canPlaceOnFoundation");
 
    console.groupEnd();

    if (!top) return card.rank === "A";
    return (
      card.suit === top.suit &&
      rankValue[card.rank] === rankValue[top.rank] + 1
    );
  },

  /* ---------------- CORE MOVE ENGINE ---------------- */

  moveCards: ({ cards, from, to }) => {
    if (!cards?.length) return;

    const state = get();
    const first = cards[0];

    /* ---------------- SAVE HISTORY (IMPORTANT) ---------------- */
    const snapshot = {
      stock: state.stock,
      stockIndex: state.stockIndex,
      tableau: state.tableau.map((p) => [...p]),
      foundations: state.foundations.map((p) => [...p]),
    };

    // helper — only call after validation passes
    const saveHistory = () =>
      set({ history: [...get().history, snapshot], future: [] });

    /* ---------------- TABLEAU → TABLEAU ---------------- */
    if (
      from.type === "tableau" &&
      to.type === "tableau"
    ) {
      if (!state.canPlaceOnTableau(first, to.column)) return;

      set((state) => {
        const tableau = [...state.tableau];

        tableau[from.column] = tableau[from.column].slice(
          0,
          tableau[from.column].length - cards.length
        );

        tableau[to.column] = [
          ...tableau[to.column],
          ...cards,
        ];

        return { tableau };
      });

      state.flipTopTableauCard(from.column);
      return;
    }

    /* ---------------- TABLEAU → FOUNDATION ---------------- */
if (from.type === "tableau" && to.type === "foundation") {

  const sourcePile = state.tableau[from.column];
  const topCard = sourcePile[sourcePile.length - 1];

  // ONLY allow the top tableau card
  if (
    cards.length !== 1 ||
    !topCard ||
    topCard.id !== first.id
  ) {
    return;
  }

  if (!state.canPlaceOnFoundation(first, to.foundation)) return;

  saveHistory();

  set((state) => {
    const tableau = state.tableau.map((pile, i) => {
      if (i !== from.column) return pile;

      const updated = pile.slice(0, -1);

      // flip next card
      if (
        updated.length &&
        !updated[updated.length - 1].faceUp
      ) {
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          faceUp: true,
        };
      }

      return updated;
    });

    const foundations = state.foundations.map((pile, i) =>
      i === to.foundation
        ? [...pile, first]
        : pile
    );

    return { tableau, foundations };
  });

  return;
}

    /* ---------------- WASTE → TABLEAU ---------------- */
    if (
      from.type === "waste" &&
      to.type === "tableau"
    ) {
      if (!state.canPlaceOnTableau(first, to.column)) return;
      saveHistory(); // 
      set((state) => {
        const tableau = [...state.tableau];

        tableau[to.column] = [
          ...tableau[to.column],
          first,
        ];

        const stock = state.stock.filter(
          (c) => c.id !== first.id
        );

        return { tableau, stock };
      });

      return;
    }


if (from.type === "waste" && to.type === "foundation") {
  if (!state.canPlaceOnFoundation(first, to.foundation)) return;
  saveHistory();

  set((state) => {
    const foundations = state.foundations.map((pile, i) =>
      i === to.foundation ? [...pile, first] : pile
    );
    const stock = state.stock.filter((c) => c.id !== first.id);
    return { foundations, stock };
  });
  return;
}


  },

  /* ---------------- UNDO ---------------- */

  undo: () => {
    const state = get();

    if (state.history.length === 0) return;

    const previous =
      state.history[state.history.length - 1];

    const future = [
      {
        stock: state.stock,
        stockIndex: state.stockIndex,
        tableau: state.tableau,
        foundations: state.foundations,
      },
      ...state.future,
    ];

    set({
      ...previous,
      history: state.history.slice(0, -1),
      future,
    });
  },

  /* ---------------- REDO ---------------- */

  redo: () => {
    const state = get();

    if (state.future.length === 0) return;

    const next = state.future[0];

    const history = [
      ...state.history,
      {
        stock: state.stock,
        stockIndex: state.stockIndex,
        tableau: state.tableau,
        foundations: state.foundations,
      },
    ];

    set({
      ...next,
      history,
      future: state.future.slice(1),
    });
  },
}));

export default useGameStore;