import { useEffect, useState } from "react";

export default function Wordle() {
  const numRows = 6;   // Players get 6 guesses
  const numCols = 5;   // Each guess is a 5-letter word

  const targetWord = "PLANT"; // This is the correct word (will be checked in Step 2)

  // Board is a 2D array: 6 rows of 5 blank tiles
  const [board, setBoard] = useState(
    Array.from({ length: numRows }, () => Array(numCols).fill(""))
  );

  // Track tile statuses (green/yellow/gray – we'll map colors later)
  const [statuses, setStatuses] = useState(
    Array.from({ length: numRows }, () => Array(numCols).fill(""))
  );

  // Tracks the current row and letter column being typed
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);

  // Keyboard input logic
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (currentRow >= numRows) return; // Don't accept input after all guesses used

      const key = e.key;

      if (key === "Backspace") {
        // Remove the last letter typed (move cursor back)
        setBoard((prev) => {
          const copy = [...prev];
          if (currentCol > 0) {
            copy[currentRow][currentCol - 1] = "";
            setCurrentCol(currentCol - 1);
          }
          return copy;
        });
      } else if (key === "Enter") {
        // Only move to the next row if the current guess is full
        if (currentCol === numCols) {
          const guess = board[currentRow].join("");
          console.log("Player guessed:", guess);

          // -------- Generate tile feedback --------
          const newStatuses = Array(numCols).fill("gray");
          const letterCount = {}; // Track how many times each letter appears in targetWord

          // Count letters in targetWord
          for (let char of targetWord) {
            letterCount[char] = (letterCount[char] || 0) + 1;
          }

          // First pass: correct positions (green)
          for (let i = 0; i < numCols; i++) {
            if (guess[i] === targetWord[i]) {
              newStatuses[i] = "green";
              letterCount[guess[i]]--;
            }
          }

          // Second pass: wrong position but correct letter (yellow)
          for (let i = 0; i < numCols; i++) {
            if (
              newStatuses[i] !== "green" &&
              targetWord.includes(guess[i]) &&
              letterCount[guess[i]] > 0
            ) {
              newStatuses[i] = "yellow";
              letterCount[guess[i]]--;
            }
          }

          // Update statuses for this row
          setStatuses((prev) => {
            const copy = [...prev];
            copy[currentRow] = newStatuses;
            return copy;
          });

          // Check win condition
          if (guess === targetWord) {
            alert("🎉 You guessed it!");
            return; // Stop further input
          }

          setCurrentRow(currentRow + 1);
          setCurrentCol(0);
        }
      } else if (/^[a-zA-Z]$/.test(key)) {
        // If a valid letter key is pressed
        if (currentCol < numCols) {
          setBoard((prev) => {
            const copy = [...prev];
            copy[currentRow][currentCol] = key.toUpperCase(); // Capitalize letters
            return copy;
          });
          setCurrentCol(currentCol + 1);
        }
      }
    };

    // Attach keyboard listener
    window.addEventListener("keydown", handleKeyDown);

    // Clean up listener when component unmounts
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [board, currentRow, currentCol]);

  // --- Virtual keyboard layout (QWERTY style) ---
  const keyboardRows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Enter", "Z", "X", "C", "V", "B", "N", "M", "Backspace"],
  ];

  // --- Handles virtual key presses by simulating real keydown events ---
  function handleVirtualKey(key) {
    const event = new KeyboardEvent("keydown", {
      key,
      bubbles: true,
    });
    window.dispatchEvent(event);
  }

  return (
    <div className="flex flex-col items-center gap-6 mt-10">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-2">
          {row.map((letter, colIndex) => {
            const status = statuses[rowIndex][colIndex];

            // NINAYT colors yellow=correct, blue=wrong place
            let bg = "bg-white";
            if (status === "green") bg = "bg-yellow-400 text-white";      // correct spot => yellow
            else if (status === "yellow") bg = "bg-blue-200 text-black";  // letter present elsewhere => light blue
            else if (status === "gray") bg = "bg-gray-300 text-white";    // not in word, gray

            return (
              <div
                key={colIndex}
                className={`w-12 h-12 border-2 border-gray-300 rounded-md flex items-center justify-center text-xl font-bold ${bg}`}
              >
                {letter}
              </div>
            );
          })}
        </div>
      ))}

      {/* Tailwind keyboard */}
      <div className="flex flex-col gap-2 mt-6 w-full max-w-md">
        {keyboardRows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-1">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => handleVirtualKey(key)}
                className={`flex-1 sm:flex-none sm:w-10 md:w-12 lg:w-14 h-12 rounded-lg shadow text-sm font-medium bg-white border border-gray-300 hover:bg-gray-100 transition ${
                  key === "Enter" || key === "Backspace" ? "sm:w-20 md:w-24" : ""
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
