// Page.test.js
// tests game renders and buttons work

import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Solitaire from "../components/Solitaire";
import useGameStore from "../store/useGameStore";

jest.mock("../components/TableauColumn", () => () => <div />);
jest.mock("../components/FoundationPile", () => () => <div />);
jest.mock("../components/StockArea", () => () => <div />);
jest.mock("../components/WinScreen", () => () => <div />);

jest.mock("../store/useGameStore", () => {
  const mockStore = jest.fn();
  mockStore.getState = jest.fn(() => ({ clearDraggingIds: jest.fn() }));
  mockStore.subscribe = jest.fn(() => jest.fn());
  return mockStore;
});

jest.mock("../components/createGame", () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
  createDeck: jest.fn(() => []),
}));

describe("Solitaire game", () => {
  const undo = jest.fn();
  const showHint = jest.fn();
  const initializeGame = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    useGameStore.mockImplementation((selector) =>
      selector({
        initializeGame,
        foundations: [[], [], [], []],
        undo,
        showHint,
      })
    );
  });

  it("renders the game controls", () => {
    render(<Solitaire />);

    expect(
      screen.getByRole("button", { name: "Undo" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Hint" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "New Game" })
    ).toBeInTheDocument();
  });

  it("calls the correct actions when buttons are clicked", () => {
    render(<Solitaire />);

    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    fireEvent.click(screen.getByRole("button", { name: "Hint" }));
    fireEvent.click(screen.getByRole("button", { name: "New Game" }));

    expect(undo).toHaveBeenCalledTimes(1);
    expect(showHint).toHaveBeenCalledTimes(1);
    expect(initializeGame).toHaveBeenCalledTimes(2);
  });
});