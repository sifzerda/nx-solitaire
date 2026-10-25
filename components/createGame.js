// /components/createGame.js

/* -------------------- GAME INIT -------------------- */

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const LETTER = { "♠": "S", "♥": "H", "♦": "D", "♣": "C" };

// Reuse immutable metadata; return fresh card objects to every caller.
const DECK = SUITS.flatMap(suit => RANKS.map(rank => Object.freeze({
  suit, rank, id: `${rank}${suit}`, image: `/cards/${rank}${LETTER[suit]}.svg`,
})));

export function createDeck() {
  return DECK.map(card => ({ ...card }));
}

export default function createGame() {
  const deck = createDeck();
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  let cursor = 0;
  const tableau = Array.from({ length: 7 }, (_, column) =>
    Array.from({ length: column + 1 }, (_, row) => ({ ...deck[cursor++], faceUp: row === column }))
  );
  return { stock: deck.slice(cursor), stockIndex: 0, tableau, foundations: [[], [], [], []] };
}
