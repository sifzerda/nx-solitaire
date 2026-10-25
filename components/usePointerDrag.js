// components/usePointerDrag.js
"use client";

import useGameStore from "../store/useGameStore";

let drag = null;
let container = null;
let images = [];
let frame = null;
let hovered = null;
let unsubscribe = null;
let pointerX = 0;
let pointerY = 0;
const SOURCES = new WeakMap();

function clearHighlight() {
  if (!hovered) return;
  hovered.classList.remove("dropzone-hover");
  hovered.style.outline = hovered.dataset.dragPreviousOutline ?? "";
  hovered.style.outlineOffset = hovered.dataset.dragPreviousOutlineOffset ?? "";
  delete hovered.dataset.dragPreviousOutline;
  delete hovered.dataset.dragPreviousOutlineOffset;
  hovered = null;
}

function getDropTarget(x, y) {
  const element = document.elementFromPoint(x, y)?.closest("[data-dropzone]");
  if (!element) return null;
  const to = {
    type: element.dataset.dropzone,
    column: element.dataset.column === undefined ? undefined : Number(element.dataset.column),
    foundation: element.dataset.foundation === undefined ? undefined : Number(element.dataset.foundation),
  };
  return { element, to };
}

function updatePosition() {
  frame = null;
  if (!drag || !container) return;
  container.style.transform = `translate3d(${pointerX - drag.offsetX}px, ${pointerY - drag.offsetY}px, 0)`;
  const target = getDropTarget(pointerX, pointerY);
  const valid = target && useGameStore.getState().canMoveCards({ cards: drag.cards, from: drag.source, to: target.to });
  const element = valid ? target.element : null;
  if (element === hovered) return;
  clearHighlight();
  if (element) {
    hovered = element;
    hovered.dataset.dragPreviousOutline = hovered.style.outline;
    hovered.dataset.dragPreviousOutlineOffset = hovered.style.outlineOffset;
    hovered.classList.add("dropzone-hover");
    hovered.style.outline = "2px solid #4ade80";
    hovered.style.outlineOffset = "2px";
  }
}

function onMove(event) {
  if (!drag || event.pointerId !== drag.pointerId) return;
  if (event.cancelable) event.preventDefault();
  pointerX = event.clientX;
  pointerY = event.clientY;
  if (frame === null) frame = requestAnimationFrame(updatePosition);
}

export function cancelPointerDrag() {
  if (frame !== null) cancelAnimationFrame(frame);
  frame = null;
  unsubscribe?.();
  unsubscribe = null;
  window.removeEventListener("pointermove", onMove);
  window.removeEventListener("pointerup", onUp);
  window.removeEventListener("pointercancel", onCancel);
  window.removeEventListener("blur", cancelPointerDrag);
  document.removeEventListener("visibilitychange", onVisibility);
  drag = null;
  clearHighlight();
  if (container) container.style.display = "none";
  useGameStore.getState().clearDraggingIds();
}

function onUp(event) {
  if (!drag || event.pointerId !== drag.pointerId) return;
  const { cards, source } = drag;
  const target = getDropTarget(event.clientX, event.clientY);
  // Cleanup first: a successful move also changes the watched board references.
  cancelPointerDrag();
  if (target) useGameStore.getState().moveCards({ cards, from: source, to: target.to });
}
function onCancel(event) {
  if (drag && event.pointerId === drag.pointerId) cancelPointerDrag();
}
function onVisibility() {
  if (document.hidden) cancelPointerDrag();
}

export function disposePointerDrag() {
  cancelPointerDrag();
  container?.remove();
  container = null;
  images = [];
}

function startDrag(event, payload) {
  if (event.isPrimary === false || (event.button !== undefined && event.button !== 0)) return;
  if (!useGameStore.getState().canDragCards(payload)) return;
  event.preventDefault();
  cancelPointerDrag();

  const element = event.currentTarget;
  const rect = element.getBoundingClientRect();
  const styles = getComputedStyle(element);
  const overlap = styles.getPropertyValue("--card-overlap").trim() || "0px";
  if (!container) {
    container = document.createElement("div");
    Object.assign(container.style, {
      position: "fixed", left: "0", top: "0", zIndex: "9999",
      pointerEvents: "none", willChange: "transform", userSelect: "none",
    });
    container.setAttribute("aria-hidden", "true");
    document.body.appendChild(container);
  }
  container.style.width = `${rect.width}px`;
  // Copy inherited sizing variables for calc()/var() based overlap values.
  for (const name of ["--card-width", "--card-height", "--card-overlap"]) {
    container.style.setProperty(name, styles.getPropertyValue(name));
  }
  while (images.length < payload.cards.length) {
    const image = document.createElement("img");
    image.draggable = false;
    image.alt = "";
    Object.assign(image.style, { borderRadius: "6px", pointerEvents: "none", objectFit: "contain" });
    images.push(image);
    container.appendChild(image);
  }
  images.forEach((image, index) => {
    const card = payload.cards[index];
    image.style.display = card ? "block" : "none";
    if (!card) return;
    image.style.width = `${rect.width}px`;
    image.style.height = `${rect.height}px`;
    image.style.marginTop = index ? overlap : "0";
    if (SOURCES.get(image) !== card.image) {
      image.src = card.image;
      SOURCES.set(image, card.image);
    }
  });

  drag = { ...payload, pointerId: event.pointerId, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
  pointerX = event.clientX;
  pointerY = event.clientY;
  container.style.display = "block";
  updatePosition();
  useGameStore.getState().setDraggingIds(payload.cards.map(card => card.id));

  // Restart, undo, or any external board edit cancels a stale drag immediately.
  unsubscribe = useGameStore.subscribe((state, previous) => {
    if (state.stock !== previous.stock || state.stockIndex !== previous.stockIndex || state.tableau !== previous.tableau || state.foundations !== previous.foundations) cancelPointerDrag();
  });
  window.addEventListener("pointermove", onMove, { passive: false });
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onCancel);
  window.addEventListener("blur", cancelPointerDrag);
  document.addEventListener("visibilitychange", onVisibility);
}

// Stable functions; no store subscription or event listeners per card.
const API = { startDrag };
export default function usePointerDrag() {
  return API;
}
