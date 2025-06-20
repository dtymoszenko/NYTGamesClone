import { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";

/* -------------------------------------------------------------------------- */
/*                               PUZZLE DATA                                  */
/* -------------------------------------------------------------------------- */

function saveGameProgress(gameName) {
  const store = JSON.parse(localStorage.getItem("gameProgress") || "{}");
  if (!store[gameName]) {
    store[gameName] = true;
    localStorage.setItem("gameProgress", JSON.stringify(store));
    window.dispatchEvent(new Event("gameCompleted"));
  }
}

// 6×8 letter grid (Actual puzzle!!!)
// Row 0 → top row, Row 7 → bottom row
const initialGrid = [
  ["V", "I", "N", "G", "G", "O"],
  ["L", "O", "S", "O", "G", "R"],
  ["E", "I", "U", "E", "U", "C"],
  ["T", "F", "P", "P", "G", "E"],
  ["H", "U", "T", "A", "E", "L"],
  ["G", "L", "N", "F", "U", "N"],
  ["U", "H", "E", "V", "N", "Y"],
  ["O", "T", "R", "E", "L", "C"],
];

// Valid answers for personal puzzle.. I'm so excited to show this to her
const wordList = [
  "CUPPIE", //spanogram
  "ELEGANT",
  "THOUGHTFUL",
  "CLEVER",
  "GORGEOUS",
  "FUNNY",
  "LOVING",
];

const SPANGRAM = "CUPPIE";

/* -------------------------------------------------------------------------- */
/*                            MAIN COMPONENT                                  */
/* -------------------------------------------------------------------------- */

export default function Strands() {
  /* ----------------------------- React State ----------------------------- */

  // Tiles currently highlighted while dragging
  const [selected, setSelected] = useState([]);

  // All tiles that have been confirmed as part of a found word
  const [found, setFound] = useState([]);

  // Paths for words that have been found (so their lines stay visible + blue)
  const [paths, setPaths] = useState([]);

  // Keys for tiles that belong to the spangram (“CUPPIE”)
  const [spangramTiles, setSpangramTiles] = useState([]);

  // Quick feedback text for the user (“✅ …” or “❌ …”)
  const [message, setMessage] = useState("");

  // True only while the mouse button is held down (enables drag-select)
  const [isDragging, setIsDragging] = useState(false);

  // Stores words that have been found in the puzzle properly
  const [foundWords, setFoundWords] = useState([]);

  // Show the win screen modal once the strands puzzle is completed
  const [showWin, setShowWin] = useState(false);

  // State for if the string is copied or not (result to share)
  const [copied, setCopied] = useState(false);

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

  // Re-paint whenever the current drag *or* saved paths change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Helper to draw one complete path in a given colour
    const drawPath = (path, colour) => {
      // Ignore paths with fewer than two tiles — nothing to draw
      if (path.length < 2) return;

      // Set stroke appearance (color, width, corner style, end caps)
      ctx.strokeStyle = colour; // Color of the connecting line
      ctx.lineWidth = 6; // Line thickness
      ctx.lineJoin = "round"; // Rounded corners between segments
      ctx.lineCap = "round"; // Rounded line ends
      ctx.beginPath(); // Start a new drawing path

      // Loop through each pair of consecutive tiles in the path
      for (let i = 0; i < path.length - 1; i++) {
        // Convert "row-col" strings into numeric row and column values
        const [r1, c1] = path[i].split("-").map(Number);
        const [r2, c2] = path[i + 1].split("-").map(Number);

        // Determine the direction from the first tile to the next
        const dRow = Math.sign(r2 - r1); // Vertical movement: -1, 0, or 1
        const dCol = Math.sign(c2 - c1); // Horizontal movement: -1, 0, or 1

        if (dRow === 0 || dCol === 0) {
          // For straight lines (horizontal or vertical):
          // draw from the edge of the first tile to the edge of the second tile
          const start = getEdge(r1, c1, dRow, dCol);
          const end = getEdge(r2, c2, -dRow, -dCol);
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
        } else {
          // For diagonal lines:
          // draw from one corner of the first tile to the opposite corner of the second tile
          const offX = (dCol * tileSize) / 2;
          const offY = (dRow * tileSize) / 2;

          const start = {
            x: c1 * (tileSize + gap) + tileSize / 2 + offX,
            y: r1 * (tileSize + gap) + tileSize / 2 + offY,
          };
          const end = {
            x: c2 * (tileSize + gap) + tileSize / 2 - offX,
            y: r2 * (tileSize + gap) + tileSize / 2 - offY,
          };

          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
        }
      }

      // Render the entire line path to the canvas
      ctx.stroke();
    };

    // Draw words that are found in blue and make them stay
    paths.forEach((path) => {
      const word = path
        .map((coord) => {
          const [r, c] = coord.split("-").map(Number);
          return initialGrid[r][c];
        })
        .join("");

      const color = word === "CUPPIE" ? "#facc15" : "#3b82f6"; // yellow or tailwind blue500
      drawPath(path, color);
    });

    // Draw the current in-progress drag in gray (no change from before)
    drawPath(selected, "#94a3b8"); // Tailwind slate-400
  }, [selected, paths]);

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

  // Called on mouse-up OR when leaving the grid — stop drag mode and submit/clear guess
  const handleEnd = () => {
    setIsDragging(false);

    // Only submit if user was actively dragging tiles
    if (selected.length > 0) {
      const word = getSelectedWord();

      //Ensure that a word is included in the list and not already found
      if (wordList.includes(word) && !foundWords.includes(word)) {
        // Valid word: save it
        setFound([...found, ...selected]);
        setPaths((p) => [...p, selected]);

        // record the word itself
        const newWords = [...foundWords, word];
        setFoundWords(newWords);

        //mark tiles as yellow if spanogram
        if (getSelectedWord() === "CUPPIE") {
          setSpangramTiles(selected); // mark as should be yellow when completed (because == hardcoded spanogram)
        }

        //Show the win modal if all words have been found
        if (newWords.length === wordList.length) {
          saveGameProgress("strands");
          setShowWin(true);
          setCopied(false);
          //Confetti when winning!! :D
          confetti({
            particleCount: 180,
            spread: 90,
            origin: { y: 0.6 },
          });
        }

        setSelected([]);
        setMessage(`✅ Found "${word}"!`);
      } else {
        // Invalid word: just clear the selection
        setSelected([]);
        setMessage(`❌ "${word}" is not apart of this puzzle!`);
      }
    }
  };

  //Functions for mobile support (touching and dragging on MOBILE)
  // Handle finger tap start (touch equivalent of mouse down)
  // Handle finger tap start
  const handleTouchStart = (e, row, col) => {
    e.preventDefault(); // Prevent scrolling
    setIsDragging(true); // Starting dragging condition to be true hardcoded (mobile)
    handleStart(row, col);
  };

  // Handle finger drag across grid
  const handleTouchMove = (e) => {
    e.preventDefault(); // Prevent scrolling

    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);

    //Updated touch dragging logic to track finger movement and call handleEnter repeatedly
    if (
      target &&
      target.dataset &&
      target.dataset.row !== undefined &&
      target.dataset.col !== undefined
    ) {
      const row = parseInt(target.dataset.row);
      const col = parseInt(target.dataset.col);
      handleEnter(row, col);
    }
  };

  // Handle finger release
  const handleTouchEnd = () => {
    handleEnd();
  };

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
      setPaths((p) => [...p, selected]);

      // rrecord the word itself
      const newWords = [...foundWords, word];
      setFoundWords(newWords);

      // Show win screen if puzzle is completed
      if (newWords.length === wordList.length) {
        setShowWin(true);
        setCopied(false);
        //confetti for winning!!
        confetti({
          particleCount: 180,
          spread: 90,
          origin: { y: 0.6 },
        });
      }

      if (getSelectedWord() === "CUPPIE") {
        setSpangramTiles(selected); // mark as should be yellow when completed (because == hardcoded spanogram)
      }

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

  // Build a row of dots in the exact order the player found the words
  // build 4-on-top, 3-on-bottom dot layout just like how NYT does it
  const dots = foundWords.map((w) => (w === SPANGRAM ? "🟡" : "🔵"));
  const dotString = dots.slice(0, 4).join("") + "\n" + dots.slice(4).join("");

  // Text that is built which is what will be copied to clipboard (if button is clicked)
  const shareText = `NinaYT Strands - The Perfect Girl\n${dotString}\n`;

  return (
    <div
      className="flex flex-col items-center gap-6 px-4 pb-10"
      onMouseUp={handleEnd} // stop drag when mouse released
      onMouseLeave={handleEnd} // …or if pointer leaves grid wrapper
    >
      {/* --------------------------- Header / Stats ------------------------- */}
      <div className="text-center">
        {/* Puzzle theme prompt */}
        <p className="text-sm font-semibold text-blue-600">TODAY'S THEME</p>
        <h2 className="text-2xl font-bold mt-1">The Perfect Girl</h2>

        {/* Found word Counter (hardcoded for this example*/}
        <p className="mt-2 text-gray-700 text-sm">
          {foundWords.length} of 7 theme words found.
        </p>
      </div>

      {/* ------------------------ Grid + Canvas Layer ----------------------- */}
      <div className="relative w-[384px] h-[576px]">
        {/* Canvas sits on top of grid, pointer-events-none means clicks pass through */}
        <canvas
          ref={canvasRef}
          width={384} /* 6 tiles × 56px + 5 gaps × 8px */
          height={576} /* 8 tiles × 56px + 7 gaps × 8px */
          className="absolute top-0 left-0 pointer-events-none"
        />

        {/* 6×8 letter grid (CSS grid) */}
        <div className="grid grid-cols-6 gap-2 select-none touch-none">
          {initialGrid.map((row, r) =>
            row.map((letter, c) => {
              // Convert (row,col) into a string key for quick lookups
              const key = `${r}-${c}`;

              // Status checks
              const isSel = selected.includes(key); // currently highlighted
              const isFound = found.includes(key); // already confirmed word

              //Used google/stack/chatGPT to help with logic of changing color based on spanogram
              const tileClass = isFound
                ? spangramTiles.includes(key)
                  ? "bg-yellow-300 border-yellow-500 text-white" // spangram tiles
                  : "bg-blue-300  border-blue-500  text-white" // regular found word
                : isSel
                ? "bg-gray-200 border-gray-400" // actively selecting
                : "bg-white    border-gray-300 hover:bg-gray-100"; // normal tile

              return (
                <div
                  key={key}
                  data-row={r}
                  data-col={c}
                  onMouseDown={() => handleStart(r, c)} // begin drag
                  onMouseEnter={() => handleEnter(r, c)} // continue drag
                  onTouchStart={(e) => handleTouchStart(e, r, c)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  // Dynamic Tailwind classes: colour depends on status
                  className={`w-14 h-14 text-xl font-bold border rounded-md 
                              flex items-center justify-center cursor-pointer 
                              transition-colors ${tileClass}`}
                >
                  {letter}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* --------------------------- Feedback Text ------------------------- */}
      {message && (
        <p className="text-center text-sm text-gray-700 mt-2">{message}</p>
      )}

      {showWin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg text-center w-72 shadow-xl rounded-2xl">
            <h2 className="text-3xl font-bold mb-2">Perfect!</h2>
            <p className="font-semibold">Strands – The Perfect Girl</p>

            {/* dots */}
            <pre className="text-2xl mt-4 whitespace-pre">{dotString}</pre>

            {/* Buttons for copy or closing (similar to wordle) */}
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(shareText);
                  setCopied(true);
                }}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                {copied ? "Copied ✔" : "Copy Results"}
              </button>

              <button
                onClick={() => setShowWin(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
