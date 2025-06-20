// Mini.jsx
// ---------------------------------------------------------------------------
// 5×5 crossword grid (blank)
// ---------------------------------------------------------------------------

import { useState } from "react";

/* --------------------------- GRID CONSTANTS --------------------------- */
const SIZE = 5; // 5×5 mini grid
const CELL = 48; // px width/height for each square (hardcoded for now)

export default function Mini() {
  // Empty 5×5 board that can be filled later (array of arrays of letters)
  const [board] = useState(
    Array.from({ length: SIZE }, () => Array(SIZE).fill(""))
  );

  return (
    <div className="p-4 flex flex-col items-center gap-4">
      {/* Title */}
      <h1 className="text-2xl font-bold">Mini Crossword</h1>

      {/* ----------- 5×5 GRID ----------- */}
      <div
        className="grid gap-[2px]"
        style={{
          gridTemplateColumns: `repeat(${SIZE}, ${CELL}px)`,
          gridTemplateRows: `repeat(${SIZE}, ${CELL}px)`,
        }}
      >
        {board.flatMap((row, r) =>
          row.map((_, c) => (
            <div
              /* key uses r & c so React is happy */
              key={`${r}-${c}`}
              className="w-12 h-12 flex items-center justify-center border border-black bg-white text-lg font-semibold select-none"
              style={{ width: CELL, height: CELL }}
            >
              {/* letter will go here later */}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
