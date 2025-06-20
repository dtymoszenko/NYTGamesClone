// Mini.jsx
// ---------------------------------------------------------------------------
// 5×5 crossword grid with black boxes, automatic clue numbers, answer checks,
// blue-text locks for correct letters, red slashes for wrong letters, and a
// Wordle-style on-screen keyboard.
// ---------------------------------------------------------------------------

import { useState, useMemo } from "react";

/* ---------- GRID CONSTANTS ---------- */
const SIZE = 5; // 5 rows × 5 columns
const CELL = 72; // pixel size of each square

/* ---------- ON-SCREEN KEYBOARD ---------- */
const kbRows = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M", "Backspace", "Enter"],
];

/* ---------- BOARD DATA ---------- */
const blackBoxes = new Set(["0-3", "0-4", "1-4", "4-0"]); // black squares

// Hardcoded board
const solution = [
  ["S", "P", "A", "", ""],
  ["H", "A", "N", "D", ""],
  ["O", "R", "G", "A", "N"],
  ["P", "I", "E", "T", "A"],
  ["", "S", "L", "A", "Y"],
];

/* ------------------------------------------------------------------------ */
export default function Mini() {
  /* ---------- STATE ---------- */
  const [board, setBoard] = useState(
    Array.from({ length: SIZE }, () => Array(SIZE).fill(""))
  );
  const [status, setStatus] = useState(
    Array.from({ length: SIZE }, () => Array(SIZE).fill(null))
  ); // null|true|false
  const [selected, setSelected] = useState(null); // [row,col]

  /* ---------- AUTO-NUMBERING ---------- */
  const clueNumbers = useMemo(() => {
    let across = 1;
    let down = 1;
    const map = {}; // { "r-c": num }

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const key = `${r}-${c}`;
        if (blackBoxes.has(key)) continue;

        const startsAcross = c === 0 || blackBoxes.has(`${r}-${c - 1}`);
        const startsDown = r === 0 || blackBoxes.has(`${r - 1}-${c}`);

        if (startsAcross) {
          map[key] = across++; // give the Across number
          if (startsDown) down++; // <-- keep Down counter in sync
        } else if (startsDown) {
          map[key] = down++;
        }
      }
    }
    return map;
  }, []);

  /* ---------- HANDLERS ---------- */
  const handleCellClick = (r, c) => {
    if (!blackBoxes.has(`${r}-${c}`)) setSelected([r, c]);
  };

  const updateCell = (r, c, ch) => {
    setBoard((prev) =>
      prev.map((row, ri) => row.map((v, ci) => (ri === r && ci === c ? ch : v)))
    );
    setStatus((prev) =>
      prev.map((row, ri) =>
        row.map((v, ci) => (ri === r && ci === c ? null : v))
      )
    );
  };

  const handleKey = (key) => {
    if (!selected) return;
    const [r, c] = selected;
    if (blackBoxes.has(`${r}-${c}`) || status[r][c] === true) return;

    if (key === "Backspace") {
      updateCell(r, c, "");
      return;
    }
    const ch = key.toUpperCase();
    if (/^[A-Z]$/.test(ch)) updateCell(r, c, ch);
  };

  const checkAnswers = () => {
    setStatus((prev) =>
      prev.map((row, r) =>
        row.map((_, c) => {
          const k = `${r}-${c}`;
          if (blackBoxes.has(k)) return null;
          return board[r][c] && board[r][c] === solution[r][c];
        })
      )
    );
  };

  /* ---------- RENDER ---------- */
  return (
    <div
      className="p-4 flex flex-col items-center gap-6"
      tabIndex={0}
      onKeyDown={(e) => handleKey(e.key)}
    >
      <h1 className="text-2xl font-bold">Mini Crossword</h1>

      {/* GRID */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${SIZE},${CELL}px)`,
          gridTemplateRows: `repeat(${SIZE},${CELL}px)`,
        }}
      >
        {board.flatMap((row, r) =>
          row.map((letter, c) => {
            const key = `${r}-${c}`;

            /* ----- Black square ----- */
            if (blackBoxes.has(key))
              return (
                <div
                  key={key}
                  className="bg-black border border-black"
                  style={{ width: CELL, height: CELL }}
                />
              );

            /* ----- Typable square ----- */
            const isSel = selected?.[0] === r && selected?.[1] === c;
            const flag = status[r][c];
            const text = flag === true ? "text-blue-600" : "text-black";
            const ring = isSel ? "outline outline-2 outline-blue-400" : "";

            return (
              <div
                key={key}
                onClick={() => handleCellClick(r, c)}
                className={`relative flex items-center justify-center border border-black bg-white text-2xl font-semibold select-none cursor-pointer ${ring} ${text}`}
                style={{ width: CELL, height: CELL }}
              >
                {/* clue number */}
                {clueNumbers[key] && (
                  <span className="absolute top-[6px] left-[8px] text-base font-bold text-gray-800">
                    {clueNumbers[key]}
                  </span>
                )}

                {/* red slash if wrong */}
                {flag === false && (
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="w-full h-[2px] bg-red-500 rotate-[-45deg]" />
                  </span>
                )}

                {letter}
              </div>
            );
          })
        )}
      </div>

      {/* KEYBOARD */}
      <div className="flex flex-col items-center gap-2 mt-6 px-2 w-full max-w-xl">
        {kbRows.map((row, i) => (
          <div key={i} className="flex justify-center gap-1 w-full">
            {row.map((k) => (
              <button
                key={k}
                onClick={() => handleKey(k)}
                className={`flex-1 bg-white sm:flex-none sm:w-10 md:w-12 lg:w-14 h-12 rounded-lg shadow text-sm font-medium border border-gray-300 hover:brightness-105 transition ${
                  k === "Enter" || k === "Backspace" ? "sm:w-20 md:w-24" : ""
                }`}
              >
                {k === "Backspace" ? "⌫" : k}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* CHECK BUTTON */}
      <button
        onClick={checkAnswers}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded shadow hover:brightness-110 transition"
      >
        Check Answers
      </button>
    </div>
  );
}
