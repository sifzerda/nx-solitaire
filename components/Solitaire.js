"use client";

import { useState, useEffect } from "react";

// Simple Solitaire (Klondike-lite)
// Not full rules, but playable demo

const suits = ["♠", "♥", "♦", "♣"];
const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

function createDeck() {
  const deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value, faceUp: false });
    }
  }
  return shuffle(deck);
}

function shuffle(deck) {
  return [...deck].sort(() => Math.random() - 0.5);
}

export default function Solitaire() {
  const [deck, setDeck] = useState([]);
  const [waste, setWaste] = useState([]);
  const [foundations, setFoundations] = useState([[], [], [], []]);
  const [tableau, setTableau] = useState([[], [], [], [], [], [], []]);

  useEffect(() => {
    initGame();
  }, []);

  function initGame() {
    const newDeck = createDeck();
    let t = [[], [], [], [], [], [], []];

    for (let i = 0; i < 7; i++) {
      for (let j = 0; j <= i; j++) {
        const card = newDeck.pop();
        card.faceUp = j === i;
        t[i].push(card);
      }
    }

    setDeck(newDeck);
    setTableau(t);
    setWaste([]);
    setFoundations([[], [], [], []]);
  }

  function drawCard() {
    if (deck.length === 0) {
      setDeck(waste.map(c => ({ ...c, faceUp: false })).reverse());
      setWaste([]);
      return;
    }

    const newDeck = [...deck];
    const card = newDeck.pop();
    card.faceUp = true;

    setDeck(newDeck);
    setWaste([...waste, card]);
  }

  function canPlaceOnTableau(card, pile) {
    if (pile.length === 0) return card.value === "K";

    const top = pile[pile.length - 1];
    const red = ["♥", "♦"];

    const isOppositeColor = red.includes(card.suit) !== red.includes(top.suit);
    const isOneLess = values.indexOf(card.value) === values.indexOf(top.value) - 1;

    return isOppositeColor && isOneLess;
  }

  function moveWasteToTableau(i) {
    if (waste.length === 0) return;
    const card = waste[waste.length - 1];

    if (!canPlaceOnTableau(card, tableau[i])) return;

    const newWaste = waste.slice(0, -1);
    const newTableau = [...tableau];
    newTableau[i] = [...newTableau[i], card];

    setWaste(newWaste);
    setTableau(newTableau);
  }

  function renderCard(card, index) {
    return (
      <div
        key={index}
        className={`w-16 h-24 border rounded-md flex items-center justify-center text-lg ${card.faceUp ? "bg-white" : "bg-blue-500"}`}
      >
        {card.faceUp ? `${card.value}${card.suit}` : ""}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Solitaire</h1>

      <div className="flex gap-4 mb-6">
        <div>
          <button onClick={drawCard} className="px-4 py-2 bg-green-600 text-white rounded">
            Draw
          </button>
          <div className="mt-2">Deck: {deck.length}</div>
        </div>

        <div>
          <div className="mb-1">Waste</div>
          <div className="flex">
            {waste.slice(-1).map(renderCard)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {tableau.map((pile, i) => (
          <div key={i} className="flex flex-col gap-1">
            <button
              onClick={() => moveWasteToTableau(i)}
              className="text-xs text-blue-500"
            >
              Place Here
            </button>
            {pile.map(renderCard)}
          </div>
        ))}
      </div>

      <button
        onClick={initGame}
        className="mt-6 px-4 py-2 bg-red-500 text-white rounded"
      >
        Restart
      </button>
    </div>
  );
}
