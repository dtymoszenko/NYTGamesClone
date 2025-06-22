import { useEffect, useState } from "react";

function saveGameProgress(gameName) {
  const store = JSON.parse(localStorage.getItem("gameProgress") || "{}");
  if (!store[gameName]) {
    store[gameName] = true;
    localStorage.setItem("gameProgress", JSON.stringify(store));
    window.dispatchEvent(new Event("gameCompleted"));
  }
}

export default function Wordle() {
  const numRows = 6; // Players get 6 guesses
  const numCols = 5; // Each guess is a 5-letter word
  const STORAGE_KEY = "wordleState"; // NEW – all in one place (storage)

  const targetWord = "RAINY"; // This is the word user is guessing, currently HARDCODED obviously

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

  //Check if game is over, Lock input from keyboard/typing when set to true
  const [isGameOver, setIsGameOver] = useState(false);

  // blocks keyboard / mouse input while flip animation plays
  const [isRevealing, setIsRevealing] = useState(false);

  //Track which tiles are currently flipping
  const [flipping, setFlipping] = useState(
    Array.from({ length: numRows }, () => Array(numCols).fill(false))
  );

  // NEW: Track quick pop animation for when a tile gets a letter
  const [pops, setPops] = useState(
    Array.from({ length: numRows }, () => Array(numCols).fill(false))
  );

  // victory-modal on/off
  const [showModal, setShowModal] = useState(false);

  // text that will be copied to clipboard
  const [shareText, setShareText] = useState("");

  // track loss state to customize modal
  const [didLose, setDidLose] = useState(false);

  // Check if copied to clipboard
  const [copied, setCopied] = useState(false);

  // build the grid string
  function buildShareString(attemptLabel = currentRow + 1) {
    let grid = "";
    for (let r = 0; r <= currentRow; r++) {
      for (let c = 0; c < numCols; c++) {
        const st = statuses[r][c];
        grid += st === "yellow" ? "🟨" : st === "blue" ? "🟦" : "⬛";
      }
      if (r !== currentRow) grid += "\n";
    }
    return `NinaYT Wordle ${attemptLabel}/${numRows}\n${grid}`;
  }

  /* -------------------------------------------------------- */
  /*  Load saved board / progress if it exists on first mount  */
  /* -------------------------------------------------------- */
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && saved.targetWord === targetWord) {
        // sanity check
        setBoard(saved.board);
        setStatuses(saved.statuses);
        setKeyStatuses(saved.keyStatuses);
        setCurrentRow(saved.currentRow);
        setCurrentCol(saved.currentCol);
        setIsGameOver(saved.isGameOver);
        setDidLose(saved.didLose);
        // flipping / pops reset to false for cleanliness; reveal is always off
      }
    } catch (_) {
      /* ignore malformed storage */
    }
  }, []);

  // Keyboard input logic
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isGameOver || isRevealing) return; // also ignore during flip reveal
      if (currentRow >= numRows) return; // safety: also ignore if rows exhausted

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
          setIsRevealing(true); // lock input for this reveal cycle
          const guess = board[currentRow].join("");
          console.log("Player guessed:", guess);

          const newStatuses = Array(numCols).fill("gray");
          const letterCount = {};

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

          // Animate tiles one by one with delays
          for (let i = 0; i < numCols; i++) {
            setTimeout(() => {
              setFlipping((prev) => {
                const copy = [...prev];
                copy[currentRow][i] = true;
                return copy;
              });

              setStatuses((prev) => {
                const copy = [...prev];
                copy[currentRow][i] = newStatuses[i];
                return copy;
              });

              setKeyStatuses((prev) => {
                const updated = { ...prev };
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
                return updated;
              });

              // If last tile flip, check for game over condition
              if (i === numCols - 1) {
                setTimeout(() => {
                  if (guess === targetWord) {
                    saveGameProgress("wordle");
                    // Build share string, open modal, copy to clipboard
                    const share = buildShareString();
                    setShareText(share);
                    setShowModal(true);
                    setDidLose(false); // win
                    try {
                      navigator.clipboard.writeText(share);
                    } catch (_) {}
                    // fire confetti 🎊
                    import("canvas-confetti").then(({ default: confetti }) =>
                      confetti({
                        spread: 90,
                        particleCount: 120,
                        origin: { y: 0.8 },
                      })
                    );
                    setIsGameOver(true);
                    setIsRevealing(false); // re-enable typing for next guess
                    return;
                  }
                  if (currentRow + 1 === numRows) {
                    // Build share string and open modal on loss
                    const share = buildShareString("X");
                    setShareText(share);
                    setDidLose(true); // loss
                    setShowModal(true);
                    try {
                      navigator.clipboard.writeText(share);
                    } catch (_) {}
                    setIsGameOver(true);
                    setIsRevealing(false); // re-enable typing for next guess
                    return;
                  }
                  setCurrentRow(currentRow + 1);
                  setCurrentCol(0);
                  setIsRevealing(false); // re-enable typing for next guess
                }, 500);
              }
            }, i * 300);
          }
        }
      } else if (/^[a-zA-Z]$/.test(key)) {
        // If a valid letter key is pressed
        if (currentCol < numCols) {
          setBoard((prev) => {
            const copy = [...prev];
            copy[currentRow][currentCol] = key.toUpperCase(); // Capitalize letters
            return copy;
          });

          // Trigger a quick pop for tile that is being typed
          setPops((prev) => {
            const copy = [...prev];
            copy[currentRow][currentCol] = true;
            return copy;
          });
          // Remove pop class after animation finishes (~150 ms)
          setTimeout(() => {
            setPops((prev) => {
              const copy = [...prev];
              copy[currentRow][currentCol] = false;
              return copy;
            });
          }, 180);

          setCurrentCol(currentCol + 1);
        }
      }
    };

    // Attach keyboard listener
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [board, currentRow, currentCol, isGameOver, isRevealing, statuses]); // added statuses so buildShareString is up-to-date

  // Reset "Copied!" label whenever modal closes
  useEffect(() => {
    if (!showModal) setCopied(false);
  }, [showModal]);

  /* -------------------------------------------------------- */
  /*  Persist state to localStorage whenever it changes        */
  /* -------------------------------------------------------- */
  useEffect(() => {
    const data = {
      targetWord, // lets you detect stale save if you change puzzle
      board,
      statuses,
      keyStatuses,
      currentRow,
      currentCol,
      isGameOver,
      didLose,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [
    board,
    statuses,
    keyStatuses,
    currentRow,
    currentCol,
    isGameOver,
    didLose,
  ]);

  // --- Virtual keyboard layout (QWERTY style) ---
  const keyboardRows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Enter", "Z", "X", "C", "V", "B", "N", "M", "Backspace"],
  ];

  // --- Handles virtual key presses by simulating real keydown events ---
  function handleVirtualKey(key) {
    if (isGameOver || isRevealing) return; // block clicks during flip reveal
    const event = new KeyboardEvent("keydown", {
      key,
      bubbles: true,
    });
    window.dispatchEvent(event);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-center text-gray-800 font-semibold text-lg">
        In the Ninaverse, we play by different rules:
      </p>
      <p className="text-center text-gray-700 text-sm mt-1">
        🟨 = correct letter & position, 🟦 = correct letter wrong spot, ⬛ = not
        in the word
      </p>

      {/* ---------- WORDLE BOARD ---------- */}
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1 justify-center">
          {row.map((letter, colIndex) => {
            const status = statuses[rowIndex][colIndex];
            const isFlipping = flipping[rowIndex]?.[colIndex];
            const isPopping = pops[rowIndex]?.[colIndex];

            return (
              <div
                key={colIndex}
                className="w-14 h-14 relative"
                style={{ perspective: "800px" }}
              >
                <div
                  className="absolute inset-0 border-2 uppercase text-2xl font-bold flex items-center justify-center transition-transform duration-500"
                  style={{
                    transform: isFlipping ? "rotateX(180deg)" : "rotateX(0deg)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Used Stack Overflow to keep letter visible and upright when flipping rest of tile */}
                  {/* Front side (pre-flip) - Used Stack Overflow to keep letter present when flipping */}
                  <div
                    className="absolute inset-0 flex items-center justify-center text-black border-gray-400 bg-white"
                    style={{
                      backfaceVisibility: "hidden",
                    }}
                  >
                    {letter}
                  </div>

                  {/* Back side (post-flip) */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center text-2xl font-bold ${
                      status === "yellow"
                        ? "bg-yellow-300 text-white border-yellow-400"
                        : status === "blue"
                        ? "bg-blue-300 text-white border-blue-300"
                        : status === "gray"
                        ? "bg-gray-600 text-white border-gray-600"
                        : "bg-transparent text-black border-gray-400"
                    } ${isPopping ? "pop" : ""}`}
                    style={{
                      transform: "rotateX(180deg)",
                      backfaceVisibility: "hidden",
                    }}
                  >
                    {letter}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* ---------- VICTORY MODAL ---------- */}
      {showModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60">
          <div className="bg-white rounded-xl p-6 w-80 text-center space-y-4">
            <h2 className="text-2xl font-bold">
              {didLose
                ? `😔 You lost! The word was ${targetWord}`
                : "🎉 You guessed it!"}
            </h2>

            {/* share grid */}
            <pre className="font-mono whitespace-pre leading-5">
              {shareText}
            </pre>

            <button
              onClick={() => {
                navigator.clipboard.writeText(shareText).then(() => {
                  setCopied(true);
                  // Auto-reset after 2s so user can copy again if desired
                  setTimeout(() => setCopied(false), 2000);
                });
              }}
              className="w-full bg-yellow-300 text-white py-2 rounded-lg shadow hover:brightness-105 transition-colors"
            >
              {copied ? "Copied!" : "Copy to clipboard"}
            </button>

            <button
              onClick={() => setShowModal(false)}
              className="text-sm text-gray-500 hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="h-5"></div>
      {/* ---------- TAILWIND KEYBOARD ---------- */}
      <div className="flex flex-col gap-2 mt-28 w-full max-w-md">
        {keyboardRows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-1">
            {row.map((key) => {
              const status = keyStatuses[key];
              // Map key status to background color
              let keyColor = "bg-white text-black";
              if (status === "yellow") keyColor = "bg-yellow-300 text-white";
              else if (status === "blue") keyColor = "bg-blue-200 text-black";
              else if (status === "gray") keyColor = "bg-gray-400 text-white";

              return (
                <button
                  key={key}
                  onClick={() => handleVirtualKey(key)}
                  className={`flex-1 sm:flex-none sm:w-10 md:w-12 lg:w-14 h-12 rounded-lg shadow text-sm font-medium border border-gray-300 hover:brightness-105 transition ${keyColor} ${
                    key === "Enter" || key === "Backspace"
                      ? "sm:w-20 md:w-24"
                      : ""
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
