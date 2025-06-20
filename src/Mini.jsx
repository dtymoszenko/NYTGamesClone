// Mini.jsx
// ---------------------------------------------------------------------------
// 5×5 crossword grid with clue numbers, letter input, and styled keyboard
// ---------------------------------------------------------------------------

import { useState } from "react";

/* --------------------------- GRID CONSTANTS --------------------------- */
const SIZE = 5; // Grid is 5 rows × 5 columns
const CELL = 72; // Size of each cell in pixels

// On-screen keyboard rows (standard QWERTY)
const kbRows = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M", "Backspace", "Enter"],
];

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
  function handleKey(key) {
    if (!selected) return;

    const [r, c] = selected;

    if (key === "Backspace") {
      const updated = board.map((row, ri) =>
        row.map((val, ci) => (ri === r && ci === c ? "" : val))
      );
      setBoard(updated);
      return;
    }

    const letter = key.toUpperCase();
    if (letter.length === 1 && letter >= "A" && letter <= "Z") {
      const updated = board.map((row, ri) =>
        row.map((val, ci) => (ri === r && ci === c ? letter : val))
      );
      setBoard(updated);
    }
  }

  // Handles physical keyboard typing
  function handleKeyDown(e) {
    handleKey(e.key);
  }

  // Sets the selected cell when clicked
  function handleCellClick(r, c) {
    setSelected([r, c]);
  }

  return (
    <div
      className="p-4 flex flex-col items-center gap-6"
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

      {/* On-screen keyboard */}
      <div className="flex flex-col items-center gap-2 mt-6 px-2 w-full max-w-xl">
        {kbRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1 w-full">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => handleKey(key)}
                className={`flex-1 bg-white sm:flex-none sm:w-10 md:w-12 lg:w-14 h-12 rounded-lg shadow text-sm font-medium border border-gray-300 hover:brightness-105 transition ${
                  key === "Enter" || key === "Backspace"
                    ? "sm:w-20 md:w-24"
                    : ""
                }`}
              >
                {key === "Backspace" ? "⌫" : key}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
