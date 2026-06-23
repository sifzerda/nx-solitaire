// /components/createGame.js

/* -------------------- GAME INIT -------------------- */

const suits = ["♠", "♥", "♦", "♣"];
const ranks = [ "A","2","3","4","5","6", "7","8","9","10","J","Q","K" ];
const suitLetter = { "♠": "S", "♥": "H", "♦": "D", "♣": "C" };

export function createDeck() {
  return suits.flatMap((suit) =>
    ranks.map((rank) => ({
      suit,
      rank,
      id: `${rank}${suit}`,
      image: `/cards/${rank}${suitLetter[suit]}.svg`,
    }))
  );
}

function shuffle(array) {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(
      Math.random() * (i + 1)
    );

    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function createGame() {
  const shuffled = shuffle(createDeck());
  const tableau = Array.from({ length: 7 }, () => []);
  let index = 0;

  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      tableau[col].push({
        ...shuffled[index],
        faceUp: row === col,
      });
      index++;
    }
  }

  return {
    stock: shuffled.slice(index),
    stockIndex: 0,
    tableau,
    foundations: [[], [], [], []],
  };
}