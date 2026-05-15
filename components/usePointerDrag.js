// components/usePointerDrag.js

"use client";

import useGameStore from "./useGameStore";
//import { CARD_SIZE, CARD_PIXELS } from "./cardSizing";

// module-level — one instance, never reset by re-renders
let dragData = null;
let dragElement = null;
let rafRef = null;
let latestPos = { x: 0, y: 0 };

export default function usePointerDrag() {
  const moveCards = useGameStore((s) => s.moveCards);

function createDragElement(cards) {
  const el = document.createElement("div");

  const styles = getComputedStyle(document.documentElement);

  const cardWidth = styles.getPropertyValue("--card-width").trim();
  const overlap = styles.getPropertyValue("--card-overlap").trim();

  el.style.position = "fixed";
  el.style.left = "0";
  el.style.top = "0";
  el.style.zIndex = "9999";
  el.style.pointerEvents = "none";
  el.style.willChange = "transform";

  cards.forEach((card, idx) => {
    const img = document.createElement("img");

    img.src = card.image;
    img.draggable = false;

    img.style.width = cardWidth;
    img.style.borderRadius = "6px";
    img.style.display = "block";

    if (idx > 0) {
      img.style.marginTop = overlap;
    }

    el.appendChild(img);
  });

  document.body.appendChild(el);
  dragElement = el;
}

  function updatePosition() {
    rafRef = null;
    if (!dragElement) return;
    dragElement.style.transform =
      `translate3d(${latestPos.x}px, ${latestPos.y}px, 0)`;
  }

  function onPointerMove(e) {
    latestPos = {
      x: e.clientX - dragData.offsetX,
      y: e.clientY - dragData.offsetY,
    };
    if (!rafRef) rafRef = requestAnimationFrame(updatePosition);
  }

function onPointerUp(e) {
  if (!dragData) return;

  const { cards, source } = dragData;
  const elements = document.elementsFromPoint(e.clientX, e.clientY);
  const dropEl = elements.find((el) => el.dataset.dropzone);

  if (dropEl) {
    const to = {
      type: dropEl.dataset.dropzone,
      column: dropEl.dataset.column !== undefined
        ? Number(dropEl.dataset.column) : undefined,
      foundation: dropEl.dataset.foundation !== undefined
        ? Number(dropEl.dataset.foundation) : undefined,
    };
    moveCards({ cards, from: source, to });
  }

  cleanup();
}
  function cleanup() {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    dragElement?.remove();
    dragElement = null;
    dragData = null;
    if (rafRef) cancelAnimationFrame(rafRef);
    rafRef = null;
  }

  function startDrag(e, dragPayload) {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const { cards, source } = dragPayload;

    dragData = {
      cards,
      source,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };

    createDragElement(cards);
    latestPos = {
      x: e.clientX - dragData.offsetX,
      y: e.clientY - dragData.offsetY,
    };
    updatePosition();

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  }

  return { startDrag };
}