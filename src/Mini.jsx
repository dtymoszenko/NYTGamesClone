// Mini.jsx
// ---------------------------------------------------------------------------
// 5×5 crossword grid with clue numbers and letter input
// ---------------------------------------------------------------------------

import { useState } from "react";

/* --------------------------- GRID CONSTANTS --------------------------- */
const SIZE = 5; // Grid is 5 rows × 5 columns
const CELL = 72; // Size of each cell in pixels

export default function Mini() {
  // Stores the letters typed into each cell
  const [board, setBoard] = useState(
    Array.from({ length: SIZE }, () => Array(SIZE).fill(""))
  );

  // Tracks which cell is currently selected
  const [selected, setSelected] = useState(null); // Format: [row, col]

  // Numbers shown in the corner of clue-starting cells
  const numbers = {
    "0-0": 1,
    "0-2": 2,
    "1-1": 3,
    "2-0": 4,
    "3-3": 5,
  };

  // Handles typing letters into the selected cell
  // Used Stack, ChatGPT, and Reddit to understand this function/logic
  function handleKeyDown(e) {
    if (!selected) return;

    const key = e.key.toUpperCase();
    if (key.length === 1 && key >= "A" && key <= "Z") {
      const [r, c] = selected;
      const updated = board.map((row, ri) =>
        row.map((val, ci) => (ri === r && ci === c ? key : val))
      );
      setBoard(updated);
    }
  }

  // Sets the selected cell when clicked
  function handleCellClick(r, c) {
    setSelected([r, c]);
  }

  return (
    <div
      className="p-4 flex flex-col items-center gap-4"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Game title */}
      <h1 className="text-2xl font-bold">Mini Crossword</h1>

      {/* Crossword grid */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${SIZE}, ${CELL}px)`,
          gridTemplateRows: `repeat(${SIZE}, ${CELL}px)`,
        }}
      >
        {board.flatMap((row, r) =>
          row.map((letter, c) => {
            const key = `${r}-${c}`;
            const isSelected = selected?.[0] === r && selected?.[1] === c;

            return (
              <div
                key={key}
                onClick={() => handleCellClick(r, c)}
                className={`relative flex items-center justify-center border border-black bg-white text-2xl font-semibold select-none cursor-pointer ${
                  isSelected ? "outline outline-2 outline-blue-400" : ""
                }`}
                style={{ width: CELL, height: CELL }}
              >
                {/* Clue number (if applicable) */}
                {numbers[key] && (
                  <span className="absolute top-[6px] left-[8px] text-base font-bold text-gray-800">
                    {numbers[key]}
                  </span>
                )}

                {/* Typed letter */}
                {letter}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
