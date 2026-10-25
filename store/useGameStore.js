// stores/useGameStore.js

import { create } from "zustand";

const SUITS = ["♠", "♥", "♦", "♣"];

const RED = new Set(["♥", "♦"]);

const RANK = {
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
  K: 13
};

const EMPTY_IDS = [];

let hintTimer;

// All board edits below are immutable, so history can safely share these arrays.
const snapshot = ({
  stock,
  stockIndex,
  tableau,
  foundations
}) => ({
  stock,
  stockIndex,
  tableau,
  foundations
});

const isIndex = (index, length) => Number.isInteger(index) && index >= 0 && index < length;

const emptyBoard = () => ({
  stock: [],
  stockIndex: -1,
  tableau: Array.from({
    length: 7
  }, () => []),
  foundations: Array.from({
    length: 4
  }, () => [])
});

function tableauAllows(card, pile) {
  if (!card || !pile || !RANK[card.rank]) return false;
  const top = pile[pile.length - 1];
  return !top ? card.rank === "K" : top.faceUp === true && RED.has(card.suit) !== RED.has(top.suit) && RANK[card.rank] === RANK[top.rank] - 1;
}

function foundationAllows(card, pile, index) {
  if (!card || !pile || card.suit !== SUITS[index]) return false;
  const top = pile[pile.length - 1];
  return !top ? card.rank === "A" : RANK[card.rank] === RANK[top.rank] + 1;
}

// Resolve supplied IDs against the board; never trust card data from a stale drag.
function resolveSource(state, cards, from) {
  if (!Array.isArray(cards) || !cards.length || !from) return null;
  if (from.type === "waste") {
    const card = state.stock[state.stockIndex];
    return cards.length === 1 && card && cards[0]?.id === card.id ? [card] : null;
  }
  if (from.type !== "tableau" || !isIndex(from.column, 7)) return null;
  const pile = state.tableau[from.column];
  const start = pile.length - cards.length;
  if (start < 0) return null;
  for (let i = 0; i < cards.length; i++) {
    const card = pile[start + i];
    if (!card.faceUp || card.id !== cards[i]?.id) return null;
    if (i && !tableauAllows(card, [pile[start + i - 1]])) return null;
  }
  return pile.slice(start);
}

function resolveMove(state, payload) {
  if (!payload?.to) return null;
  const {
    from,
    to
  } = payload;
  const cards = resolveSource(state, payload.cards, from);
  if (!cards) return null;
  if (to.type === "tableau") {
    if (!isIndex(to.column, 7) || from.type === "tableau" && from.column === to.column) return null;
    if (!tableauAllows(cards[0], state.tableau[to.column])) return null;
  } else if (to.type === "foundation") {
    if (!isIndex(to.foundation, 4) || cards.length !== 1 || !foundationAllows(cards[0], state.foundations[to.foundation], to.foundation)) return null;
  } else return null;
  return cards;
}

function clearHintTimer() {
  clearTimeout(hintTimer);
  hintTimer = undefined;
}

const useGameStore = create((set, get) => {
  // One notification per successful board action, including its undo entry.
  function commit(state, patch) {
    clearHintTimer();
    set({
      ...patch,
      history: [...state.history, snapshot(state)],
      future: [],
      hint: null,
      draggingIds: EMPTY_IDS
    });
  }
  return {
    ...emptyBoard(),
    draggingIds: EMPTY_IDS,
    history: [],
    future: [],
    hint: null,
    initializeGame: game => {
      clearHintTimer();
      const clonePile = pile => pile.map(card => ({
        ...card
      }));
      set({
        stock: clonePile(game.stock),
        stockIndex: game.stock.length - 1,
        tableau: game.tableau.map(clonePile),
        foundations: game.foundations.map(clonePile),
        history: [],
        future: [],
        hint: null,
        draggingIds: EMPTY_IDS
      });
    },
    nextStockCard: () => {
      const state = get();
      // Preserve the existing cycle: stop at index zero until reset is pressed.
      if (state.stockIndex <= 0 || !state.stock.length) return;
      commit(state, {
        stockIndex: state.stockIndex - 1
      });
    },
    resetStockCycle: () => {
      const state = get();
      const index = state.stock.length - 1;
      if (index === state.stockIndex) return;
      commit(state, {
        stockIndex: index
      });
    },
    flipTopTableauCard: column => {
      const state = get();
      if (!isIndex(column, 7)) return false;
      const pile = state.tableau[column];
      const top = pile[pile.length - 1];
      if (!top || top.faceUp) return false;
      const tableau = [...state.tableau];
      tableau[column] = [...pile.slice(0, -1), {
        ...top,
        faceUp: true
      }];
      commit(state, {
        tableau
      });
      return true;
    },

    // Compatibility helper. Keep stockIndex valid and preserve unchanged piles.
    removeCardFromAll: id => {
      const state = get();
      const removedIndex = state.stock.findIndex(card => card.id === id);
      const stock = removedIndex < 0 ? state.stock : state.stock.filter(card => card.id !== id);
      const removeFromPiles = piles => {
        const next = piles.map(pile => pile.some(card => card.id === id) ? pile.filter(card => card.id !== id) : pile);
        return next.some((pile, i) => pile !== piles[i]) ? next : piles;
      };
      const tableau = removeFromPiles(state.tableau);
      const foundations = removeFromPiles(state.foundations);
      if (stock === state.stock && tableau === state.tableau && foundations === state.foundations) return;
      let stockIndex = state.stockIndex;
      if (removedIndex >= 0 && removedIndex < stockIndex) stockIndex--;
      stockIndex = Math.min(stockIndex, stock.length - 1);
      clearHintTimer();
      // This legacy helper intentionally stays outside undo, as before.
      set({
        stock,
        stockIndex,
        tableau,
        foundations,
        hint: null,
        draggingIds: EMPTY_IDS
      });
    },

    canPlaceOnTableau: (card, column) => isIndex(column, 7) && tableauAllows(card, get().tableau[column]),

    canPlaceOnFoundation: (card, index) => isIndex(index, 4) && foundationAllows(card, get().foundations[index], index),

    canDragCards: ({
      cards,
      source
    }) => !!resolveSource(get(), cards, source),

    canMoveCards: payload => !!resolveMove(get(), payload),

    moveCards: payload => {
      const state = get();
      const cards = resolveMove(state, payload);
      if (!cards) return false;
      const {
        from,
        to
      } = payload;
      const patch = {};
      if (from.type === "tableau") {
        patch.tableau = [...state.tableau];
        patch.tableau[from.column] = state.tableau[from.column].slice(0, -cards.length);
      } else {
        patch.stock = state.stock.filter((_, index) => index !== state.stockIndex);
        patch.stockIndex = Math.min(state.stockIndex, patch.stock.length - 1);
      }
      if (to.type === "tableau") {
        const tableau = patch.tableau ?? [...state.tableau];
        tableau[to.column] = [...state.tableau[to.column], ...cards.map(card => card.faceUp ? card : {
          ...card,
          faceUp: true
        })];
        patch.tableau = tableau;
      } else {
        patch.foundations = [...state.foundations];
        patch.foundations[to.foundation] = [...state.foundations[to.foundation], {
          ...cards[0],
          faceUp: true
        }];
      }
      commit(state, patch);
      return true;
    },

    findHint: () => {
      const state = get();
      const hint = (card, from, to) => ({
        from: {
          ...from,
          cardId: card.id
        },
        to
      });
      // Same priority as before: tableau foundation, waste foundation,
      // tableau move, waste move. Never propose an invalid descending run.
      for (let column = 0; column < 7; column++) {
        const pile = state.tableau[column];
        const card = pile[pile.length - 1];
        if (!card?.faceUp) continue;
        for (let foundation = 0; foundation < 4; foundation++) {
          if (foundationAllows(card, state.foundations[foundation], foundation)) return hint(card, {
            type: "tableau",
            column
          }, {
            type: "foundation",
            foundation
          });
        }
      }
      const waste = state.stock[state.stockIndex];
      if (waste) {
        for (let foundation = 0; foundation < 4; foundation++) {
          if (foundationAllows(waste, state.foundations[foundation], foundation)) return hint(waste, {
            type: "waste"
          }, {
            type: "foundation",
            foundation
          });
        }
      }
      for (let column = 0; column < 7; column++) {
        const pile = state.tableau[column];
        for (let i = 0; i < pile.length; i++) {
          const card = pile[i];
          if (!card.faceUp) continue;
          const cards = pile.slice(i);
          for (let target = 0; target < 7; target++) {
            const from = {
              type: "tableau",
              column
            };
            const to = {
              type: "tableau",
              column: target
            };
            if (resolveMove(state, {
              cards,
              from,
              to
            })) return hint(card, from, to);
          }
        }
      }
      if (waste) {
        for (let column = 0; column < 7; column++) {
          if (tableauAllows(waste, state.tableau[column])) return hint(waste, {
            type: "waste"
          }, {
            type: "tableau",
            column
          });
        }
      }
      return null;
    },

    showHint: () => {
      clearHintTimer();
      const hint = get().findHint();
      set({
        hint
      });
      if (hint) hintTimer = setTimeout(() => {
        if (get().hint === hint) set({
          hint: null
        });
        hintTimer = undefined;
      }, 1500);
    },

    setHint: hint => {
      clearHintTimer();
      set({
        hint
      });
    },

    clearHint: () => {
      clearHintTimer();
      if (get().hint) set({
        hint: null
      });
    },

    setDraggingIds: ids => set({
      draggingIds: ids.length ? ids : EMPTY_IDS
    }),
    clearDraggingIds: () => {
      if (get().draggingIds.length) set({
        draggingIds: EMPTY_IDS
      });
    },

    undo: () => {
      const state = get();
      if (!state.history.length) return;
      clearHintTimer();
      set({
        ...state.history[state.history.length - 1],
        history: state.history.slice(0, -1),
        future: [snapshot(state), ...state.future],
        hint: null,
        draggingIds: EMPTY_IDS
      });
    },

    redo: () => {
      const state = get();
      if (!state.future.length) return;
      clearHintTimer();
      set({
        ...state.future[0],
        history: [...state.history, snapshot(state)],
        future: state.future.slice(1),
        hint: null,
        draggingIds: EMPTY_IDS
      });
    }
  };
});

export default useGameStore;
