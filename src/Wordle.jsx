import { useEffect, useState } from "react";

export default function Wordle() {
  const numRows = 6;   // Players get 6 guesses
  const numCols = 5;   // Each guess is a 5-letter word

  const targetWord = "PLANT"; // This is the word user is guessing, currently HARDCODED obviously

  // Board is a 2D array: 6 rows of 5 blank tiles
  const [board, setBoard] = useState(
    Array.from({ length: numRows }, () => Array(numCols).fill(""))
  );

  // Track tile statuses
  const [statuses, setStatuses] = useState(
    Array.from({ length: numRows }, () => Array(numCols).fill(""))
  );

  // Tracking each letter’s best status for keyboard coloring
  const [keyStatuses, setKeyStatuses] = useState({});

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

          // First pass: correct positions  → mark status "yellow"
          for (let i = 0; i < numCols; i++) {
            if (guess[i] === targetWord[i]) {
              newStatuses[i] = "yellow";
              letterCount[guess[i]]--;
            }
          }

          // Second pass: wrong spot but correct letter → mark status "blue"
          for (let i = 0; i < numCols; i++) {
            if (
              newStatuses[i] !== "yellow" &&
              targetWord.includes(guess[i]) &&
              letterCount[guess[i]] > 0
            ) {
              newStatuses[i] = "blue";
              letterCount[guess[i]]--;
            }
          }

          // Update statuses for this row
          setStatuses((prev) => {
            const copy = [...prev];
            copy[currentRow] = newStatuses;
            return copy;
          });

          // NEW: update keyboard key colors (yellow>blue>gray priority)
          setKeyStatuses((prev) => {
            const updated = { ...prev };
            for (let i = 0; i < numCols; i++) {
              const letter = guess[i];
              const tileStatus = newStatuses[i];

              const currentStatus = updated[letter];
              if (
                tileStatus === "yellow" ||
                (tileStatus === "blue" && currentStatus !== "yellow") ||
                (tileStatus === "gray" && !currentStatus)
              ) {
                updated[letter] = tileStatus;
              }
            }
            return updated;
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
    <div className="flex flex-col items-center gap-2 mt-10">
      {/* ---------- WORDLE BOARD ---------- */}
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1 justify-center">
          {row.map((letter, colIndex) => {
            const status = statuses[rowIndex][colIndex];

            // NINAYT colors: yellow = correct spot, blue = wrong spot, gray = not present
            let tileClass =
              status === "yellow"
                ? "bg-yellow-400 text-white border-yellow-400"
                : status === "blue"
                ? "bg-blue-300 text-black border-blue-300"
                : status === "gray"
                ? "bg-gray-600 text-white border-gray-600"
                : "bg-transparent text-black border-gray-400";

            return (
              <div
                key={colIndex}
                className={`w-14 h-14 border-2 ${tileClass} uppercase flex items-center justify-center text-2xl font-bold transition-colors duration-300`}
              >
                {letter}
              </div>
            );
          })}
        </div>
      ))}

      {/* ---------- TAILWIND KEYBOARD ---------- */}
      <div className="flex flex-col gap-2 mt-6 w-full max-w-md">
        {keyboardRows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-1">
            {row.map((key) => {
              const status = keyStatuses[key];
              // Map key status to background color
              let keyColor = "bg-white text-black";
              if (status === "yellow") keyColor = "bg-yellow-400 text-white";
              else if (status === "blue") keyColor = "bg-blue-200 text-black";
              else if (status === "gray") keyColor = "bg-gray-400 text-white";

              return (
                <button
                  key={key}
                  onClick={() => handleVirtualKey(key)}
                  className={`flex-1 sm:flex-none sm:w-10 md:w-12 lg:w-14 h-12 rounded-lg shadow text-sm font-medium border border-gray-300 hover:brightness-105 transition ${keyColor} ${
                    key === "Enter" || key === "Backspace" ? "sm:w-20 md:w-24" : ""
                  }`}
                >
                  {key === "Backspace" ? "⌫" : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
