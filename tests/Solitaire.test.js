/** @jest-environment jsdom */
// Solitaire.test.js

import store from "../store/useGameStore";
import createGame, { createDeck } from "../components/createGame";
import usePointerDrag, { cancelPointerDrag, disposePointerDrag } from "../components/usePointerDrag";

// Use the actual Zustand store and drag module, not the previous source-rewrite harness.
jest.unmock("zustand");
beforeEach(() => {
  jest.useFakeTimers();
  let seed = 246813579;
  jest.spyOn(Math, "random").mockImplementation(() => {
    seed = Math.imul(seed, 1664525) + 1013904223 >>> 0;
    return seed / 4294967296;
  });
  setup();
});

afterEach(() => {
  disposePointerDrag();
  store.getState().clearHint();
  jest.clearAllTimers();
  jest.restoreAllMocks();
  jest.useRealTimers();
});

const card = (rank, suit, faceUp = true) => ({
  rank,
  suit,
  faceUp,
  id: rank + suit,
  image: '/' + rank + suit + '.svg'
});

const setup = (patch = {}) => store.getState().initializeGame({
  stock: [],
  tableau: Array.from({
    length: 7
  }, () => []),
  foundations: Array.from({
    length: 4
  }, () => []),
  ...patch
});

const columns = (...piles) => [...piles, ...Array.from({
  length: 7 - piles.length
}, () => [])];

const board = () => {
  const {
    stock,
    stockIndex,
    tableau,
    foundations
  } = store.getState();
  return {
    stock,
    stockIndex,
    tableau,
    foundations
  };
};

const move = (cards, from, to) => store.getState().moveCards({
  cards,
  from,
  to
});

const table = column => ({
  type: 'tableau',
  column
});

const foundation = foundation => ({
  type: 'foundation',
  foundation
});

test('deal contains 52 unique cards, correct pile sizes and face-up cards', () => {
  for (let n = 0; n < 30; n++) {
    const game = createGame();
    expect(game.stock.length).toBe(24);
    expect(new Set([...game.stock, ...game.tableau.flat()].map(c => c.id)).size).toBe(52);
    game.tableau.forEach((pile, i) => {
      expect(pile.length).toBe(i + 1);
      pile.forEach((c, j) => expect(c.faceUp).toBe(j === i));
    });
  }
});

test('decks and deals do not share mutable card objects', () => {
  const a = createDeck(),
    b = createDeck();
  a[0].rank = 'X';
  expect(b[0].rank).toBe('A');
});

test('empty foundations do not imply a win', () => {
  setup();
  expect(store.getState().foundations.every(p => p.length === 13)).toBe(false);
});

test('stock cycling preserves initial last-card-first order and ignores no-ops', () => {
  setup({
    stock: [card('2', '♠'), card('3', '♠'), card('4', '♠')]
  });

  const s = store.getState();
  expect(s.stockIndex).toBe(2);
  s.nextStockCard();
  s.nextStockCard();
  s.nextStockCard();
  expect(store.getState().stockIndex).toBe(0);
  expect(store.getState().history.length).toBe(2);
  s.resetStockCycle();
  expect(store.getState().stockIndex).toBe(2);
  s.resetStockCycle();
  expect(store.getState().history.length).toBe(3);
});

test('waste removal clamps the index, exposes another card, and is atomic', () => {
  const king = card('K', '♠');
  setup({
    stock: [card('2', '♥'), king]
  });
  let notifications = 0;
  const stop = store.subscribe(() => notifications++);
  expect(move([king], {
    type: 'waste'
  }, table(0))).toBe(true);
  stop();
  expect(notifications).toBe(1);
  expect(store.getState().stockIndex).toBe(0);
  expect(store.getState().stock[0].rank).toBe('2');
});

test('last waste card removal produces empty index -1 and undo restores it', () => {
  const ace = card('A', '♠');
  setup({
    stock: [ace]
  });
  move([ace], {
    type: 'waste'
  }, foundation(0));
  expect(store.getState().stockIndex).toBe(-1);
  store.getState().undo();
  expect(store.getState().stockIndex).toBe(0);
  expect(store.getState().stock.length).toBe(1);
});

test('same-column drops, non-tail cards, and stale waste cards are rejected', () => {
  const king = card('K', '♠'),
    queen = card('Q', '♥');
  setup({
    stock: [card('A', '♠'), card('2', '♠')],
    tableau: columns([king, queen])
  });
  const before = board();
  expect(move([queen], table(0), table(0))).toBe(false);
  expect(move([king], table(0), table(1))).toBe(false);
  expect(move([card('A', '♠')], {
    type: 'waste'
  }, foundation(0))).toBe(false);
  expect(board()).toEqual(before);
  expect(store.getState().history.length).toBe(0);
});

test('valid descending alternating stack moves without changing unrelated piles', () => {
  const queen = card('Q', '♥'),
    jack = card('J', '♣');
  setup({
    tableau: columns([queen, jack], [card('K', '♣')], [card('4', '♦')])
  });
  const unchanged = store.getState().tableau[2];
  expect(move([queen, jack], table(0), table(1))).toBe(true);
  expect(store.getState().tableau[1].length).toBe(3);
  expect(store.getState().tableau[2]).toBe(unchanged);
});

test('invalid sequences, face-down runs, and face-down targets are rejected', () => {
  const q = card('Q', '♥'),
    bad = card('J', '♦');
  setup({
    tableau: columns([q, bad], [card('K', '♣')])
  });
  expect(move([q, bad], table(0), table(1))).toBe(false);
  setup({
    tableau: columns([card('Q', '♥', false)], [card('K', '♣')])
  });
  expect(move([card('Q', '♥')], table(0), table(1))).toBe(false);
  setup({
    tableau: columns([q], [card('K', '♣', false)])
  });
  expect(move([q], table(0), table(1))).toBe(false);
});

test('only a correctly suited ace starts a foundation and only top cards move', () => {
  const ace = card('A', '♠');
  setup({
    tableau: columns([ace, card('K', '♥')])
  });
  expect(move([ace], table(0), foundation(0))).toBe(false);
  setup({
    stock: [ace]
  });
  expect(move([ace], {
    type: 'waste'
  }, foundation(1))).toBe(false);
  expect(move([ace], {
    type: 'waste'
  }, foundation(0))).toBe(true);
});

test('payloads use authoritative board cards rather than forged ranks', () => {
  const q = card('Q', '♥');
  setup({
    stock: [q]
  });
  expect(move([{
    ...q,
    rank: 'K'
  }], {
    type: 'waste'
  }, table(0))).toBe(false);
});

test('bad indices and missing payloads do not throw', () => {
  setup();
  for (const payload of [null, {}, {
    cards: [card('K', '♠')],
    from: table(-1),
    to: table(20)
  }]) expect(store.getState().moveCards(payload)).toBe(false);
  expect(store.getState().canPlaceOnTableau(card('K', '♠'), 99)).toBe(false);
});

test('flips remain manual and can be undone/redone', () => {
  const hidden = card('5', '♦', false),
    king = card('K', '♠');
  setup({
    tableau: columns([hidden, king])
  });
  move([king], table(0), table(1));
  expect(store.getState().tableau[0][0].faceUp).toBe(false);
  store.getState().flipTopTableauCard(0);
  expect(store.getState().tableau[0][0].faceUp).toBe(true);
  store.getState().undo();
  expect(store.getState().tableau[0][0].faceUp).toBe(false);
  store.getState().redo();
  expect(store.getState().tableau[0][0].faceUp).toBe(true);
});

test('new actions after undo discard redo; snapshots survive later edits', () => {
  setup({
    stock: [card('2', '♠'), card('3', '♠'), card('4', '♠')]
  });
  store.getState().nextStockCard();
  store.getState().undo();
  store.getState().nextStockCard();
  expect(store.getState().future.length).toBe(0);
  expect(store.getState().history[0].stockIndex).toBe(2);
});

test('restart, undo, and redo clear transient hints/drag state', () => {
  setup({
    stock: [card('2', '♠'), card('3', '♠')]
  });
  store.getState().nextStockCard();
  store.getState().setDraggingIds(['x']);
  store.getState().setHint({
    x: 1
  });
  store.getState().undo();
  expect(store.getState().draggingIds).toEqual([]);
  expect(store.getState().hint).toBe(null);
  setup();
  expect(store.getState().history.length).toBe(0);
});

test('hints preserve foundation-first priority and pass move validation', () => {
  const ace = card('A', '♠');
  setup({
    tableau: columns([ace], [card('K', '♥')])
  });
  const hint = store.getState().findHint();
  expect(hint.to.type).toBe('foundation');
  expect(store.getState().canMoveCards({
    cards: [ace],
    from: hint.from,
    to: hint.to
  })).toBe(true);
});

test('5000 legal actions and undo/redo preserve all 52 unique cards', () => {
  setup(createGame());
  let seed = 13579;
  const random = () => (seed = Math.imul(seed, 1664525) + 1013904223 >>> 0) / 4294967296;
  for (let n = 0; n < 5000; n++) {
    const s = store.getState(),
      r = random();
    if (r < .15) s.undo(); else if (r < .22) s.redo(); else {
      const hidden = s.tableau.findIndex(p => p.length && !p[p.length - 1].faceUp);
      if (hidden >= 0) s.flipTopTableauCard(hidden); else {
        const h = s.findHint();
        if (h && r < .8) {
          const cards = h.from.type === 'waste' ? [s.stock[s.stockIndex]] : s.tableau[h.from.column].slice(s.tableau[h.from.column].findIndex(c => c.id === h.from.cardId));
          expect(s.moveCards({
            cards,
            from: h.from,
            to: h.to
          })).toBe(true);
        } else if (s.stockIndex > 0) s.nextStockCard(); else s.resetStockCycle();
      }
    }
    const state = store.getState();
    const all = [...state.stock, ...state.tableau.flat(), ...state.foundations.flat()];
    expect(all.length).toBe(52);
    expect(new Set(all.map(c => c.id)).size).toBe(52);
    expect(state.stock.length ? state.stockIndex >= 0 && state.stockIndex < state.stock.length : state.stockIndex === -1).toBeTruthy();
  }
});

describe("hint timers", () => {
  test("hint disappears after 1500 ms", () => {
    setup({
      stock: [card("A", "♠")]
    });
    store.getState().showHint();
    expect(store.getState().hint).not.toBeNull();
    jest.advanceTimersByTime(1499);
    expect(store.getState().hint).not.toBeNull();
    jest.advanceTimersByTime(1);
    expect(store.getState().hint).toBeNull();
  });
  test("a new hint replaces the previous timer", () => {
    setup({
      stock: [card("A", "♠")]
    });
    store.getState().showHint();
    jest.advanceTimersByTime(1000);
    store.getState().showHint();
    jest.advanceTimersByTime(500);
    expect(store.getState().hint).not.toBeNull();
    jest.advanceTimersByTime(1000);
    expect(store.getState().hint).toBeNull();
  });

  test("new game clears the hint and its pending timer", () => {
    setup({
      stock: [card("A", "♠")]
    });
    store.getState().showHint();
    setup();
    expect(store.getState().hint).toBeNull();
    expect(jest.getTimerCount()).toBe(0);
  });
});

describe("pointer dragging", () => {
  let hitElement;
  let frames;
  let frameId;
  let originalHitTest;
  let originalHidden;
  function start() {
    const king = card("K", "♠");
    setup({
      stock: [king]
    });
    hitElement = null;
    const source = document.createElement("div");
    source.style.setProperty("--card-width", "80px");
    source.style.setProperty("--card-height", "120px");
    source.style.setProperty("--card-overlap", "-90px");
    source.getBoundingClientRect = () => ({
      left: 10,
      top: 20,
      width: 80,
      height: 120,
      right: 90,
      bottom: 140
    });
    document.body.appendChild(source);
    // A React-style event object avoids relying on jsdom implementing PointerEvent.
    usePointerDrag().startDrag({
      button: 0,
      isPrimary: true,
      pointerId: 1,
      clientX: 30,
      clientY: 40,
      currentTarget: source,
      preventDefault: jest.fn()
    }, {
      cards: [king],
      source: {
        type: "waste"
      }
    });
  }
  function pointer(type, pointerId = 1) {
    const event = new Event(type, {
      cancelable: true
    });
    Object.defineProperties(event, {
      pointerId: {
        value: pointerId
      },
      clientX: {
        value: 50
      },
      clientY: {
        value: 60
      }
    });
    window.dispatchEvent(event);
  }
  function target(type, index) {
    const element = document.createElement("div");
    element.dataset.dropzone = type;
    if (type === "tableau") element.dataset.column = String(index);
    if (type === "foundation") element.dataset.foundation = String(index);
    document.body.appendChild(element);
    hitElement = element;
    return element;
  }
  beforeEach(() => {
    frames = new Map();
    frameId = 0;
    hitElement = null;
    originalHitTest = Object.getOwnPropertyDescriptor(document, "elementFromPoint");
    originalHidden = Object.getOwnPropertyDescriptor(document, "hidden");
    // jsdom does not calculate real element hit positions.
    Object.defineProperty(document, "elementFromPoint", {
      configurable: true,
      value: jest.fn(() => hitElement)
    });
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false
    });
    jest.spyOn(window, "requestAnimationFrame").mockImplementation(callback => {
      frames.set(++frameId, callback);
      return frameId;
    });
    jest.spyOn(window, "cancelAnimationFrame").mockImplementation(id => frames.delete(id));
  });

  afterEach(() => {
    disposePointerDrag();
    document.body.replaceChildren();
    if (originalHitTest) Object.defineProperty(document, "elementFromPoint", originalHitTest); else delete document.elementFromPoint;
    if (originalHidden) Object.defineProperty(document, "hidden", originalHidden); else delete document.hidden;
  });

  test("pointer controller has a stable API", () => {
    expect(usePointerDrag()).toBe(usePointerDrag());
  });

  test("pointer movement coalesces into one pending animation frame", () => {
    start();
    for (let i = 0; i < 10; i++) pointer("pointermove");
    expect(frames.size).toBe(1);
    cancelPointerDrag();
    expect(frames.size).toBe(0);
  });

  test("secondary pointer cannot end the primary drag", () => {
    start();
    pointer("pointerup", 2);
    expect(store.getState().draggingIds).toHaveLength(1);
  });

  test("valid drop moves the card and clears the ghost and drag state", () => {
    start();
    target("tableau", 0);
    pointer("pointerup");
    expect(store.getState().tableau[0][0].rank).toBe("K");
    expect(store.getState().draggingIds).toEqual([]);
    expect(document.querySelector('[aria-hidden="true"]').style.display).toBe("none");
    expect(frames.size).toBe(0);
  });

  test("invalid drop leaves the board untouched", () => {
    start();
    const before = board();
    target("foundation", 0);
    pointer("pointerup");
    expect(board()).toEqual(before);
    expect(store.getState().draggingIds).toEqual([]);
  });

  test.each(["pointercancel", "blur"])("%s cancels without moving cards", type => {
    start();
    const before = board();
    pointer(type);
    expect(board()).toEqual(before);
    expect(store.getState().draggingIds).toEqual([]);
  });

  test("external new game cancels a stale drag before pointerup", () => {
    start();
    setup();
    target("tableau", 0);
    pointer("pointerup");
    expect(store.getState().tableau[0]).toEqual([]);
    expect(store.getState().draggingIds).toEqual([]);
  });

  test("visibility loss and unmount disposal remove drag resources", () => {
    start();
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true
    });
    document.dispatchEvent(new Event("visibilitychange"));
    expect(store.getState().draggingIds).toEqual([]);
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false
    });
    start();
    pointer("pointermove");
    const ghost = document.querySelector('[aria-hidden="true"]');
    disposePointerDrag();
    expect(ghost.isConnected).toBe(false);
    expect(frames.size).toBe(0);
    expect(store.getState().draggingIds).toEqual([]);
  });

  test("only valid destinations highlight and their previous styles are restored", () => {
    start();
    const destination = target("tableau", 0);
    destination.style.outline = "1px solid red";
    pointer("pointermove");
    for (const [id, callback] of frames) {
      frames.delete(id);
      callback(16);
    }
    expect(destination.classList.contains("dropzone-hover")).toBe(true);
    cancelPointerDrag();
    expect(destination.classList.contains("dropzone-hover")).toBe(false);
    expect(destination.style.outline).toBe("1px solid red");
  });
});
