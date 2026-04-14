"use client";

import ReduxProvider from "../redux/ReduxProvider";
import Game from "./Game";

export default function Solitaire() {
  return (
    <ReduxProvider>
      <Game />
    </ReduxProvider>
  );
}