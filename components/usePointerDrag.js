// components/usePointerDrag.js
"use client";

import useGameStore from "./useGameStore";

// module-level — one instance, never reset by re-renders
let dragData = null;
let dragElement = null;
let dragImages = [];
let imageCache = new WeakMap();
let rafRef = null;
let latestPos = { x: 0, y: 0 };
let hoveredDropzone = null;

function ensureDragContainer() {
  if (dragElement) return;

  dragElement = document.createElement("div");

  dragElement.style.position = "fixed";
  dragElement.style.left = "0";
  dragElement.style.top = "0";
  dragElement.style.zIndex = "9999";
  dragElement.style.pointerEvents = "none";
  dragElement.style.willChange = "transform";

  document.body.appendChild(dragElement);
}

export default function usePointerDrag() {
  const moveCards = useGameStore((s) => s.moveCards);

  function clearDropzoneHighlight() {
    if (!hoveredDropzone) return;

    hoveredDropzone.classList.remove("dropzone-hover");
    hoveredDropzone = null;
  }

  function setDropzoneHighlight(el) {
    if (hoveredDropzone === el) return;

    clearDropzoneHighlight();

    hoveredDropzone = el;
    hoveredDropzone.classList.add("dropzone-hover");
  }
  
  function createDragElement(cards) {
    ensureDragContainer();

    const styles = getComputedStyle(document.documentElement);
    const cardWidth = styles.getPropertyValue("--card-width").trim();
    const overlap = styles.getPropertyValue("--card-overlap").trim();

    while (dragImages.length < cards.length) {
      const img = document.createElement("img");

      img.draggable = false;
      img.style.width = cardWidth;
      img.style.borderRadius = "6px";
      img.style.display = "block";

      dragImages.push(img);
      dragElement.appendChild(img);
    }

    dragImages.forEach((img) => {
      img.style.display = "none";
      img.style.marginTop = "0";
    });

    cards.forEach((card, idx) => {
      const img = dragImages[idx];

      if (imageCache.get(img) !== card.image) {
        img.src = card.image;
        imageCache.set(img, card.image);
      }
      img.style.display = "block";

      if (idx > 0) {
        img.style.marginTop = overlap;
      }
    });

    dragElement.style.display = "block";
  }

  function updatePosition() {
    rafRef = null;

    if (!dragElement) return;

    dragElement.style.transform = `translate3d(${latestPos.x}px, ${latestPos.y}px, 0)`;
  }

  function onPointerMove(e) {
    latestPos = {
      x: e.clientX - dragData.offsetX,
      y: e.clientY - dragData.offsetY,
    };

    if (!rafRef) {
      rafRef = requestAnimationFrame(updatePosition);
    }

    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    const dropEl = elements.find((el) => el.dataset.dropzone);

    if (dropEl) {
      setDropzoneHighlight(dropEl);
    } else {
      clearDropzoneHighlight();
    }
  }
  function onPointerUp(e) {
    if (!dragData) return;

    const { cards, source } = dragData;

    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    const dropEl = elements.find((el) => el.dataset.dropzone);

    if (dropEl) {
      const to = {
        type: dropEl.dataset.dropzone,
        column: dropEl.dataset.column !== undefined ? Number(dropEl.dataset.column) : undefined,
        foundation: dropEl.dataset.foundation !== undefined ? Number(dropEl.dataset.foundation) : undefined,
      };

      moveCards({ cards, from: source, to });
    }

    cleanup();
  }
  function cleanup() {
    clearDropzoneHighlight();

    useGameStore.getState().clearDraggingIds();

    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    if (dragElement) {
      dragElement.style.display = "none";
    }
    dragData = null;

    if (rafRef) {
      cancelAnimationFrame(rafRef);
    }

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

    useGameStore.getState().setDraggingIds(cards.map((c) => c.id));

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