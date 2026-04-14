import { createSlice } from "@reduxjs/toolkit";

const suits = ["♠", "♥", "♦", "♣"];
const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

const foundationSuits = ["♠", "♥", "♦", "♦"];

function createDeck() {
  return suits.flatMap((suit) =>
    ranks.map((rank) => ({
      suit,
      rank,
      id: `${rank}${suit}`,
    }))
  );
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createGame() {
  const shuffled = shuffle(createDeck());

  const tableau = [[], [], [], [], [], [], []];
  let index = 0;

  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      tableau[col].push(shuffled[index++]);
    }
  }

  return {
    stock: shuffled.slice(index),
    tableau,
    foundations: [[], [], [], []],
  };
}

const initialState = createGame();

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    resetGame: () => createGame(),

    moveToFoundation(state, action) {
      const { card, index } = action.payload;

      state.stock = state.stock.filter((c) => c.id !== card.id);
      state.tableau = state.tableau.map((p) =>
        p.filter((c) => c.id !== card.id)
      );
      state.foundations = state.foundations.map((p) =>
        p.filter((c) => c.id !== card.id)
      );

      if (card.suit !== foundationSuits[index]) return;

      state.foundations[index].push(card);
    },

    moveToTableau(state, action) {
      const { card, index } = action.payload;

      state.stock = state.stock.filter((c) => c.id !== card.id);
      state.tableau = state.tableau.map((p) =>
        p.filter((c) => c.id !== card.id)
      );
      state.foundations = state.foundations.map((p) =>
        p.filter((c) => c.id !== card.id)
      );

      state.tableau[index].push(card);
    },

    moveToStock(state, action) {
      const card = action.payload;

      state.stock = state.stock.filter((c) => c.id !== card.id);
      state.tableau = state.tableau.map((p) =>
        p.filter((c) => c.id !== card.id)
      );
      state.foundations = state.foundations.map((p) =>
        p.filter((c) => c.id !== card.id)
      );

      state.stock.push(card);
    },
  },
});

export const {
  moveToFoundation,
  moveToTableau,
  moveToStock,
} = gameSlice.actions;

export default gameSlice.reducer;