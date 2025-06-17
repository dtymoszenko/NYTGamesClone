import { useState, useRef, useEffect } from "react";

/* -------------------------------------------------------------------------- */
/*                               PUZZLE DATA                                  */
/* -------------------------------------------------------------------------- */

// 6×8 letter grid (hard-coded sample puzzle)
// Row 0 → top row, Row 7 → bottom row
const initialGrid = [
  ["D", "U", "P", "I", "U", "I"],
  ["E", "T", "E", "A", "S", "T"],
  ["R", "P", "N", "T", "M", "E"],
  ["E", "E", "O", "P", "E", "I"],
  ["D", "U", "L", "I", "U", "N"],
  ["S", "A", "C", "E", "E", "N"],
  ["O", "T", "E", "N", "R", "U"],
  ["N", "A", "S", "O", "C", "T"],
];

// Valid answers for THIS puzzle (spangram not enforced yet)
const wordList = [
  "DUET",
  "NOTES",
  "SCALE",
  "PIANO",
  "TONE",
  "SONG",
  "OCTAVE",
  "INSTRUMENT",
];

/* -------------------------------------------------------------------------- */
/*                            MAIN COMPONENT                                  */
/* -------------------------------------------------------------------------- */

export default function Strands() {
  /* ----------------------------- React State ----------------------------- */

  // Tiles currently highlighted while dragging
  const [selected, setSelected] = useState([]);

  // All tiles that have been confirmed as part of a found word
  const [found, setFound] = useState([]);

  // Quick feedback text for the user (“✅ …” or “❌ …”)
  const [message, setMessage] = useState("");

  // True only while the mouse button is held down (enables drag-select)
  const [isDragging, setIsDragging] = useState(false);

  // Reference to our <canvas> element so we can draw connecting lines
  const canvasRef = useRef(null);

  /* --------------------------- Canvas Constants -------------------------- */

  const tileSize = 56; // Tailwind w-14 = 56 px
  const gap = 8; // Tailwind gap-2 = 8 px (space between tiles)

  /* ---------------------------------------------------------------------- */
  /*                           Canvas Helpers                               */
  /* ---------------------------------------------------------------------- */

  // Returns the exact centre of a tile (useful for diagonal lines)
  const getCenter = (row, col) => ({
    x: col * (tileSize + gap) + tileSize / 2,
    y: row * (tileSize + gap) + tileSize / 2,
  });

  // Returns the mid-point of a tile’s edge given a direction
  // dRow / dCol ∈ {-1, 0, 1}. Example: (0,1) → right edge centre
  const getEdge = (row, col, dRow, dCol) => ({
    x: col * (tileSize + gap) + tileSize / 2 + dCol * (tileSize / 2),
    y: row * (tileSize + gap) + tileSize / 2 + dRow * (tileSize / 2),
  });

  /* ---------------------------------------------------------------------- */
  /*                       Canvas Drawing Effect                            */
  /* ---------------------------------------------------------------------- */

  // Whenever `selected` changes, re-paint the path that links the tiles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height); // wipe old path

    // Need at least two tiles to draw a segment
    if (selected.length < 2) return;

    // Path visuals
    ctx.strokeStyle = "#94a3b8"; // Tailwind slate-400 (subtle grey line)
    ctx.lineWidth = 6;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    ctx.beginPath();

    // Walk pair-by-pair through `selected` to draw each segment
    for (let i = 0; i < selected.length - 1; i++) {
      const [r1, c1] = selected[i].split("-").map(Number);
      const [r2, c2] = selected[i + 1].split("-").map(Number);

      // Direction from tile 1 → tile 2
      // Figure out the direction we're moving in
      // dRow = change in row (vertical direction): -1 = up, 0 = same, 1 = down
      // dCol = change in col (horizontal direction): -1 = left, 0 = same, 1 = right
      const dRow = Math.sign(r2 - r1); // -1, 0, or 1
      const dCol = Math.sign(c2 - c1); // -1, 0, or 1

      // Horizontal or vertical (straight line): edge of box to edge of box
      if (dRow === 0 || dCol === 0) {
        const start = getEdge(r1, c1, dRow, dCol);
        const end = getEdge(r2, c2, -dRow, -dCol);
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
      }
      // Diagonal: draw from corner-to-corner instead of center-to-center (bug fix)
      else {
        const cornerOffsetX = (dCol * tileSize) / 2;
        const cornerOffsetY = (dRow * tileSize) / 2;

        // Start from corner of first tile
        const start = {
          x: c1 * (tileSize + gap) + tileSize / 2 + cornerOffsetX,
          y: r1 * (tileSize + gap) + tileSize / 2 + cornerOffsetY,
        };

        // End at the opposite corner of second tile
        const end = {
          x: c2 * (tileSize + gap) + tileSize / 2 - cornerOffsetX,
          y: r2 * (tileSize + gap) + tileSize / 2 - cornerOffsetY,
        };

        //Do actual moving
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
      }
    }

    ctx.stroke();
  }, [selected]);

  /* ---------------------------------------------------------------------- */
  /*                        Selection / Drag Logic                          */
  /* ---------------------------------------------------------------------- */

  // Helper: are two `row-col` strings next to each other (8-way)?
  const isAdjacent = (a, b) => {
    const [r1, c1] = a.split("-").map(Number);
    const [r2, c2] = b.split("-").map(Number);
    return Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1;
  };

  // Called onMouseDown — user clicks first tile
  const handleStart = (row, col) => {
    const key = `${row}-${col}`;

    // Ignore clicks on tiles that are already part of a found word
    if (found.includes(key)) return;

    setIsDragging(true);
    setSelected([key]); // start fresh
    setMessage(""); // clear any old feedback
  };

  // Called onMouseEnter while dragging — add tile if valid or allow backtrack
  const handleEnter = (row, col) => {
    if (!isDragging) return;

    const key = `${row}-${col}`;
    const last = selected[selected.length - 1];
    const secondLast = selected[selected.length - 2];

    // Don’t allow re-selecting found or already selected tiles (except for undo logic below)
    if (found.includes(key)) return;

    // Handle going back when dragging (undo)
    if (key === secondLast) {
      // If the user dragged back to the second-to-last tile, pop the last one
      setSelected(selected.slice(0, -1));
      return;
    }

    // Skip if already selected
    if (selected.includes(key)) return;

    // Only accept if it’s adjacent to the last tile in the selection
    if (isAdjacent(last, key)) {
      setSelected([...selected, key]); // extend the word path
    }
  };

  // Called on mouse-up OR when leaving the grid — stop drag mode
  const handleEnd = () => setIsDragging(false);

  /* ---------------------------------------------------------------------- */
  /*                          Word Validation                               */
  /* ---------------------------------------------------------------------- */

  // Turn the currently selected tile coords into the actual string
  const getSelectedWord = () =>
    selected
      .map((coord) => {
        const [r, c] = coord.split("-").map(Number);
        return initialGrid[r][c];
      })
      .join("");

  // Submit button → check if selected word is in `wordList`
  const handleSubmit = () => {
    const word = getSelectedWord();

    if (wordList.includes(word)) {
      // Yay! Mark tiles as “found” and clear the selection
      setFound([...found, ...selected]);
      setSelected([]);
      setMessage(`✅ Found "${word}"!`);
    } else {
      // Nope — clear selection, show error
      setSelected([]);
      setMessage(`❌ "${word}" is not a valid word`);
    }
  };

  /* ---------------------------------------------------------------------- */
  /*                              RENDER                                    */
  /* ---------------------------------------------------------------------- */

  return (
    <div
      className="flex flex-col items-center gap-6 px-4 pb-10"
      onMouseUp={handleEnd} // stop drag when mouse released
      onMouseLeave={handleEnd} // …or if pointer leaves grid wrapper
    >
      {/* --------------------------- Header / Stats ------------------------- */}
      <div className="text-center">
        {/* Puzzle theme prompt */}
        <p className="text-sm font-semibold text-blue-600">TODAY’S THEME</p>
        <h2 className="text-2xl font-bold mt-1">Key notes</h2>

        {/* Found-word counter (we divide by 4 b/c each word avg 4 letters.. this will be hardcoded to whatever I set though so doesn't rly matter) */}
        <p className="mt-2 text-gray-700 text-sm">
          {Math.floor(found.length / 4)} of 7 theme words found.
        </p>
      </div>

      {/* ------------------------ Grid + Canvas Layer ----------------------- */}
      <div className="relative">
        {/* Canvas sits on top of grid, pointer-events-none means clicks pass through */}
        <canvas
          ref={canvasRef}
          width={384} /* 6 tiles × 56px + 5 gaps × 8px */
          height={576} /* 8 tiles × 56px + 7 gaps × 8px */
          className="absolute top-0 left-0 pointer-events-none"
        />

        {/* 6×8 letter grid (CSS grid) */}
        <div className="grid grid-cols-6 gap-2 select-none">
          {initialGrid.map((row, r) =>
            row.map((letter, c) => {
              // Convert (row,col) into a string key for quick lookups
              const key = `${r}-${c}`;

              // Status checks
              const isSel = selected.includes(key); // currently highlighted
              const isFound = found.includes(key); // already confirmed word

              return (
                <div
                  key={key}
                  onMouseDown={() => handleStart(r, c)} // begin drag
                  onMouseEnter={() => handleEnter(r, c)} // continue drag
                  // Dynamic Tailwind classes: colour depends on status
                  className={`w-14 h-14 text-xl font-bold border rounded-md 
                              flex items-center justify-center cursor-pointer 
                              transition-colors
                    ${
                      isFound
                        ? "bg-green-400 border-green-600 text-white" // word found
                        : isSel
                        ? "bg-gray-200 border-gray-400" // actively selecting
                        : "bg-white border-gray-300 hover:bg-gray-100" // normal tile
                    }`}
                >
                  {letter}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ------------------------------ Buttons ---------------------------- */}
      <div className="flex items-center gap-4 mt-4">
        {/* Submit selection */}
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
        >
          Submit
        </button>

        {/* Clear current selection */}
        <button
          onClick={() => setSelected([])}
          className="text-sm text-gray-600 hover:underline"
        >
          Clear
        </button>
      </div>

      {/* --------------------------- Feedback Text ------------------------- */}
      {message && (
        <p className="text-center text-sm text-gray-700 mt-2">{message}</p>
      )}

      {/* TODO: add fade / animation to tile colour transitions for extra polish */}
    </div>
  );
}
