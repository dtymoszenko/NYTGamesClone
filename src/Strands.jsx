import { useState } from "react";

// 6x8 grid of letters (from a real puzzle example)
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

// These are the correct answers for the puzzle
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

export default function Strands() {
  // Holds the list of currently selected tiles
  const [selected, setSelected] = useState([]);

  // Stores all the tiles that were part of valid found words
  const [found, setFound] = useState([]);

  // A simple message string (like feedback after submitting)
  const [message, setMessage] = useState("");

  // This flag tracks whether the user is holding the mouse down (dragging)
  const [isDragging, setIsDragging] = useState(false);

  // Returns the letter from the grid at a given row/col
  const getLetter = (row, col) => initialGrid[row][col];

  // Helper to check if two tile positions are next to each other
  const isAdjacent = (a, b) => {
    const [r1, c1] = a.split("-").map(Number);
    const [r2, c2] = b.split("-").map(Number);
    return Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1;
  };

  // Start dragging: triggered when you first click on a tile
  const handleStart = (row, col) => {
    const key = `${row}-${col}`;
    if (found.includes(key)) return; // don't start on a used tile
    setIsDragging(true);
    setSelected([key]); // start fresh with this tile
    setMessage(""); // clear any previous messages
  };

  // Continue dragging: adds more tiles as long as they’re adjacent
  const handleEnter = (row, col) => {
    if (!isDragging) return;

    const key = `${row}-${col}`;

    // If already used or already selected, skip
    if (selected.includes(key) || found.includes(key)) return;

    const last = selected[selected.length - 1];
    if (isAdjacent(last, key)) {
      setSelected([...selected, key]);
    }
  };

  // Ends the drag interaction (released mouse)
  const handleEnd = () => {
    setIsDragging(false);
  };

  // Converts the list of selected tile positions to a word (like ['0-1','0-2'] → 'UP')
  const getSelectedWord = () =>
    selected
      .map((coord) => {
        const [r, c] = coord.split("-").map(Number);
        return initialGrid[r][c];
      })
      .join("");

  // When the user hits Submit, check if it's a real word
  const handleSubmit = () => {
    const word = getSelectedWord();

    if (wordList.includes(word)) {
      // If it's correct, mark those tiles as found
      setFound([...found, ...selected]);
      setSelected([]);
      setMessage(`✅ Found "${word}"!`);
    } else {
      // Otherwise clear the selection and show a message
      setSelected([]);
      setMessage(`❌ "${word}" is not a valid word`);
    }
  };

  return (
    <div
      className="flex flex-col items-center gap-6 px-4 pb-10"
      onMouseUp={handleEnd} // Let go of mouse = stop dragging
      onMouseLeave={handleEnd} // Moving mouse out of grid = stop dragging too
    >
      {/* Puzzle header info and progress */}
      <div className="text-center">
        <p className="text-sm font-semibold text-blue-600">TODAY’S THEME</p>
        <h2 className="text-2xl font-bold mt-1">Key notes</h2>
        <p className="mt-2 text-gray-700 text-sm">
          {Math.floor(found.length / 4)} of 7 theme words found.
        </p>
      </div>

      {/* The actual 6x8 letter grid */}
      <div className="grid grid-cols-6 gap-2 select-none">
        {initialGrid.map((row, rowIndex) =>
          row.map((letter, colIndex) => {
            const key = `${rowIndex}-${colIndex}`;
            const isSelected = selected.includes(key);
            const isFound = found.includes(key);

            return (
              <div
                key={key}
                onMouseDown={() => handleStart(rowIndex, colIndex)} // Start selection
                onMouseEnter={() => handleEnter(rowIndex, colIndex)} // Drag across
                className={`w-14 h-14 text-xl font-bold border rounded-md flex items-center justify-center cursor-pointer ${
                  isFound
                    ? "bg-green-400 border-green-600 text-white" // Found = green
                    : isSelected
                    ? "bg-yellow-300 border-yellow-500" // Active selection = yellow
                    : "bg-white border-gray-300 hover:bg-gray-100" // Default
                }`}
              >
                {letter}
              </div>
            );
          })
        )}
      </div>

      {/* Controls: Submit + Clear */}
      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
        >
          Submit
        </button>
        <button
          onClick={() => setSelected([])}
          className="text-sm text-gray-600 hover:underline"
        >
          Clear
        </button>
      </div>

      {/* Word check feedback */}
      {message && (
        <p className="text-center text-sm text-gray-700 mt-2">{message}</p>
      )}
    </div>
  );
}
