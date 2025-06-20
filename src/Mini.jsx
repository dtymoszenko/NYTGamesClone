// Mini.jsx
// ---------------------------------------------------------------------------
// 5×5 crossword grid with clue numbers, letter input, styled keyboard,
// answer-checking that locks correct letters (blue text) and slashes wrong ones.
// ---------------------------------------------------------------------------

import { useState } from "react";

/* --------------------------- GRID CONSTANTS --------------------------- */
const SIZE = 5; // 5 rows × 5 columns
const CELL = 72; // Pixel size for each cell

// QWERTY keyboard layout for the on-screen input
const kbRows = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M", "Backspace", "Enter"],
];

/* --------------------------- HARD-CODED DATA -------------------------- */
// Clue numbers for specific cells
const numbers = { "0-0": 1, "0-2": 2, "1-1": 3, "2-0": 4, "3-3": 5 };

// Full solution to the crossword — answers for checking
const solution = [
  ["C", "A", "T", "S", "Y"],
  ["A", "R", "E", "N", "A"],
  ["R", "E", "A", "C", "T"],
  ["E", "A", "S", "E", "L"],
  ["D", "U", "E", "L", "S"],
];

/* ---------------------------------------------------------------------- */
export default function Mini() {
  // Tracks what's typed into each cell
  const [board, setBoard] = useState(
    Array.from({ length: SIZE }, () => Array(SIZE).fill(""))
  );

  // Tracks the status of each cell: correct (true), incorrect (false), or untouched (null)
  const [status, setStatus] = useState(
    Array.from({ length: SIZE }, () => Array(SIZE).fill(null))
  );

  // Currently selected cell — used for placing letters
  const [selected, setSelected] = useState(null);

  /* ------------------------- HANDLERS --------------------------------- */

  // When a cell is clicked, mark it as selected
  function handleCellClick(r, c) {
    setSelected([r, c]);
  }

  // Main input logic — handles all key presses from virtual or physical keyboard
  function handleKeyPress(key) {
    if (!selected) return;
    const [r, c] = selected;

    // Don't allow edits to a correct answer
    if (status[r][c] === true) return;

    if (key === "Backspace") {
      updateCell(r, c, ""); // Clear letter
      return;
    }

    // Only accept A-Z
    const ch = key.toUpperCase();
    if (/^[A-Z]$/.test(ch)) {
      updateCell(r, c, ch); // Add letter to cell
    }
  }

  // Actually updates the board and clears status for a cell
  function updateCell(r, c, char) {
    setBoard((prev) =>
      prev.map((row, ri) =>
        row.map((v, ci) => (ri === r && ci === c ? char : v))
      )
    );

    // Reset check status for this cell
    setStatus((prev) =>
      prev.map((row, ri) =>
        row.map((v, ci) => (ri === r && ci === c ? null : v))
      )
    );
  }

  // For physical keyboard support
  function handlePhysicalKey(e) {
    handleKeyPress(e.key);
  }

  // Runs when user clicks "Check Answers" — compares board to solution
  function checkAnswers() {
    const checked = board.map((row, r) =>
      row.map((val, c) => (val ? val === solution[r][c] : null))
    );
    setStatus(checked);
  }

  /* ------------------------- RENDER ----------------------------------- */
  return (
    <div
      className="p-4 flex flex-col items-center gap-6"
      tabIndex={0}
      onKeyDown={handlePhysicalKey} // Enables typing into the grid
    >
      <h1 className="text-2xl font-bold">Mini Crossword</h1>

      {/* Crossword grid itself */}
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
            const flag = status[r][c]; // true / false / null
            const isSel = selected?.[0] === r && selected?.[1] === c;

            // Color styling
            const textColor = flag === true ? "text-blue-600" : "text-black";
            const outline = isSel ? "outline outline-2 outline-blue-400" : "";

            return (
              <div
                key={key}
                onClick={() => handleCellClick(r, c)}
                className={`relative flex items-center justify-center border border-black bg-white text-2xl font-semibold select-none cursor-pointer ${outline} ${textColor}`}
                style={{ width: CELL, height: CELL }}
              >
                {/* Show clue number if applicable */}
                {numbers[key] && (
                  <span className="absolute top-[6px] left-[8px] text-base font-bold text-gray-800">
                    {numbers[key]}
                  </span>
                )}

                {/* If incorrect, show red slash */}
                {flag === false && (
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="w-full h-[2px] bg-red-500 rotate-[-45deg]" />
                  </span>
                )}

                {/* Display the typed letter */}
                {letter}
              </div>
            );
          })
        )}
      </div>

      {/* On-screen virtual keyboard */}
      <div className="flex flex-col items-center gap-2 mt-6 px-2 w-full max-w-xl">
        {kbRows.map((row, i) => (
          <div key={i} className="flex justify-center gap-1 w-full">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
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

      {/* Check button to validate the answers */}
      <button
        onClick={checkAnswers}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded shadow hover:brightness-110 transition"
      >
        Check Answers
      </button>
    </div>
  );
}
