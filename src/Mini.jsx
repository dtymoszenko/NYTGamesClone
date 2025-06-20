// Mini.jsx
// ---------------------------------------------------------------------------
// 5×5 crossword grid with black boxes, automatic clue numbers, answer checks,
// blue-text locks for correct letters, red slashes for wrong letters, a timer,
// victory modal, reveal / check tools (dropdowns lock revealed cells), copy,
// and a Wordle-style on-screen keyboard.
// ---------------------------------------------------------------------------

import { useState, useMemo, useEffect, useRef } from "react";

function saveGameProgress(gameName) {
  const store = JSON.parse(localStorage.getItem("gameProgress") || "{}");
  if (!store[gameName]) {
    store[gameName] = true;
    localStorage.setItem("gameProgress", JSON.stringify(store));
    window.dispatchEvent(new Event("gameCompleted"));
  }
}

/* ---------- GRID SETUP ---------- */
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

// Hard-coded solution grid (empty strings correspond to black squares)
const solution = [
  ["S", "P", "A", "", ""],
  ["H", "A", "N", "D", ""],
  ["O", "R", "G", "A", "N"],
  ["P", "I", "E", "T", "A"],
  ["", "S", "L", "A", "Y"],
];

// Clues for crossword
const clues = {
  across: {
    "0-0": "A",
    "1-0": "B",
    "2-0": "C",
    "3-0": "D",
    "4-1": "E",
  },
  down: {
    "0-0": "F",
    "0-1": "G",
    "0-2": "H",
    "0-3": "I",
    "0-4": "J",
  },
};

// Creates easily traversible sorting of clues (used for arrows where hints are written)
const clueOrder = [
  ...Object.keys(clues.across).map((key) => ({ key, direction: "across" })),
  ...Object.keys(clues.down).map((key) => ({ key, direction: "down" })),
];

export default function Mini() {
  /* ---------- STATE ---------- */
  const [board, setBoard] = useState(
    Array.from({ length: SIZE }, () => Array(SIZE).fill(""))
  );
  const [status, setStatus] = useState(
    Array.from({ length: SIZE }, () => Array(SIZE).fill(null))
  ); // null | true | false
  const [selected, setSelected] = useState(null); // active [row,col]
  const [direction, setDirection] = useState("across"); // typing direction
  const [elapsed, setElapsed] = useState(0); // seconds since start
  const [showModal, setShowModal] = useState(false); // victory modal
  const [copySuccess, setCopySuccess] = useState(false); // copied hint
  //refs for dropdowns
  const checkMenuRef = useRef(null);
  const revealMenuRef = useRef(null);
  const timerRef = useRef(null);

  // dropdown menus for the toolbar
  const [showRevealMenu, setShowRevealMenu] = useState(false);
  const [showCheckMenu, setShowCheckMenu] = useState(false);

  const containerRef = useRef(null); // autofocus wrapper

  // tracks if game is completed
  const hasMarkedComplete = useRef(false);

  /* ---------- EFFECT: start timer ---------- */
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Stops timer once victory is achieved
  /* ---------- EFFECT: stop timer on win ---------- */
  useEffect(() => {
    if (showModal) {
      clearInterval(timerRef.current);
    }
  }, [showModal]);

  /* ---------- EFFECT: autofocus & 1-Across cursor ---------- */
  useEffect(() => {
    containerRef.current?.focus();
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (!blackBoxes.has(`${r}-${c}`)) {
          setSelected([r, c]);
          return;
        }
      }
    }
  }, []);

  //Listener which detects whenever the board is completed, and implementing game storage
  useEffect(() => {
    const isCorrect = board.every((row, r) =>
      row.every((cell, c) =>
        blackBoxes.has(`${r}-${c}`) ? true : cell === solution[r][c]
      )
    );

    if (isCorrect && !hasMarkedComplete.current) {
      setShowModal(true);

      const store = JSON.parse(localStorage.getItem("gameProgress") || "{}");
      if (!store["mini"]) {
        store["mini"] = true;
        localStorage.setItem("gameProgress", JSON.stringify(store));
        window.dispatchEvent(new Event("gameCompleted"));
      }

      hasMarkedComplete.current = true;
    }
  }, [board]);

  // Listen for clicks not in dropdown (to close it)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        checkMenuRef.current &&
        !checkMenuRef.current.contains(e.target) &&
        revealMenuRef.current &&
        !revealMenuRef.current.contains(e.target)
      ) {
        setShowCheckMenu(false);
        setShowRevealMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------- AUTO-NUMBERING ---------- */
  const clueNumbers = useMemo(() => {
    let across = 1,
      down = 1;
    const map = {};
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const key = `${r}-${c}`;
        if (blackBoxes.has(key)) continue;

        const startsAcross = c === 0 || blackBoxes.has(`${r}-${c - 1}`);
        const startsDown = r === 0 || blackBoxes.has(`${r - 1}-${c}`);

        if (startsAcross) {
          map[key] = across++;
          if (startsDown) down++; // if it’s a start of both, advance both counters
        } else if (startsDown) {
          map[key] = down++;
        }
      }
    }
    return map;
  }, []);

  /* ---------- CURRENT WORD (for highlight) ---------- */
  const currentWordCells = useMemo(() => {
    if (!selected) return new Set();
    const [r, c] = selected;
    const cells = new Set();

    if (direction === "across") {
      let start = c;
      while (start > 0 && !blackBoxes.has(`${r}-${start - 1}`)) start--;
      let end = c;
      while (end < SIZE - 1 && !blackBoxes.has(`${r}-${end + 1}`)) end++;
      for (let i = start; i <= end; i++) cells.add(`${r}-${i}`);
    } else {
      let start = r;
      while (start > 0 && !blackBoxes.has(`${start - 1}-${c}`)) start--;
      let end = r;
      while (end < SIZE - 1 && !blackBoxes.has(`${end + 1}-${c}`)) end++;
      for (let i = start; i <= end; i++) cells.add(`${i}-${c}`);
    }
    return cells;
  }, [selected, direction]);

  // Find clue associated with what word is being selected
  const getCurrentClue = () => {
    if (!selected) return null;
    const [r, c] = selected;
    let startR = r,
      startC = c;

    if (direction === "across") {
      while (startC > 0 && !blackBoxes.has(`${r}-${startC - 1}`)) startC--;
      return clues.across[`${r}-${startC}`] || "(No clue)";
    } else {
      while (startR > 0 && !blackBoxes.has(`${startR - 1}-${c}`)) startR--;
      return clues.down[`${startR}-${c}`] || "(No clue)";
    }
  };

  // Finds which clue (indexed) I am currently located at, and allows to go from 1A->2A or 3D->4D, etc etc using arrows
  const getCurrentClueIndex = () => {
    if (!selected) return -1;
    const [r, c] = selected;
    let startR = r,
      startC = c;

    if (direction === "across") {
      while (startC > 0 && !blackBoxes.has(`${r}-${startC - 1}`)) startC--;
      return clueOrder.findIndex(
        (clue) => clue.key === `${r}-${startC}` && clue.direction === "across"
      );
    } else {
      while (startR > 0 && !blackBoxes.has(`${startR - 1}-${c}`)) startR--;
      return clueOrder.findIndex(
        (clue) => clue.key === `${startR}-${c}` && clue.direction === "down"
      );
    }
  };

  // Function which actually moves to next clue (using logic from before)
  const goToClue = (index) => {
    const { key, direction } = clueOrder[index];
    const [r, c] = key.split("-").map(Number);
    setSelected([r, c]);
    setDirection(direction);
  };

  /* ---------- CURSOR HELPERS ---------- */
  const nextCell = (r, c) => {
    if (direction === "across") {
      for (let nc = c + 1; nc < SIZE; nc++) {
        if (blackBoxes.has(`${r}-${nc}`)) break;
        if (status[r][nc] !== true) return [r, nc];
      }
    } else {
      for (let nr = r + 1; nr < SIZE; nr++) {
        if (blackBoxes.has(`${nr}-${c}`)) break;
        if (status[nr][c] !== true) return [nr, c];
      }
    }
    return [r, c];
  };
  const prevCell = (r, c) => {
    if (direction === "across") {
      for (let nc = c - 1; nc >= 0; nc--) {
        if (blackBoxes.has(`${r}-${nc}`)) break;
        if (status[r][nc] !== true) return [r, nc];
      }
    } else {
      for (let nr = r - 1; nr >= 0; nr--) {
        if (blackBoxes.has(`${nr}-${c}`)) break;
        if (status[nr][c] !== true) return [nr, c];
      }
    }
    return [r, c];
  };

  /* ---------- CORE MUTATIONS ---------- */
  const updateCell = (r, c, ch) => {
    setBoard((prev) =>
      prev.map((row, ri) => row.map((v, ci) => (ri === r && ci === c ? ch : v)))
    );
    // any manual edit resets that square’s status back to null
    setStatus((prev) =>
      prev.map((row, ri) =>
        row.map((v, ci) => (ri === r && ci === c ? null : v))
      )
    );
  };

  /* ---------- REVEAL UTILITIES (lock & blue) ---------- */
  const revealSquare = () => {
    if (!selected) return;
    const [r, c] = selected;
    if (blackBoxes.has(`${r}-${c}`)) return;
    updateCell(r, c, solution[r][c]);
    setStatus((prev) =>
      prev.map((row, ri) =>
        row.map((v, ci) => (ri === r && ci === c ? true : v))
      )
    );
  };

  const revealWord = () => {
    const coords = Array.from(currentWordCells).map((k) =>
      k.split("-").map(Number)
    );
    coords.forEach(([r, c]) => updateCell(r, c, solution[r][c]));
    setStatus((prev) =>
      prev.map((row, ri) =>
        row.map((v, ci) =>
          coords.some(([r2, c2]) => r2 === ri && c2 === ci) ? true : v
        )
      )
    );
  };

  const revealPuzzle = () => {
    setBoard(solution.map((r) => [...r]));
    setStatus((prev) =>
      prev.map((row, r) =>
        row.map((_, c) => (blackBoxes.has(`${r}-${c}`) ? null : true))
      )
    );
  };

  /* ---------- CHECK UTILITIES ---------- */
  const checkSquare = () => {
    if (!selected) return;
    const [r, c] = selected;
    if (blackBoxes.has(`${r}-${c}`)) return;
    setStatus((prev) =>
      prev.map((row, ri) =>
        row.map((v, ci) =>
          ri === r && ci === c ? board[r][c] === solution[r][c] : v
        )
      )
    );
  };

  const checkWord = () => {
    const updates = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
    currentWordCells.forEach((key) => {
      const [r, c] = key.split("-").map(Number);
      updates[r][c] = board[r][c] === solution[r][c];
    });
    setStatus((prev) =>
      prev.map((row, r) =>
        row.map((v, c) => (updates[r][c] !== null ? updates[r][c] : v))
      )
    );
  };

  const checkPuzzle = () => {
    setStatus((prev) =>
      prev.map((row, r) =>
        row.map((_, c) =>
          blackBoxes.has(`${r}-${c}`) ? null : board[r][c] === solution[r][c]
        )
      )
    );
    // victory?
    if (
      board.every((row, r) =>
        row.every((cell, c) =>
          blackBoxes.has(`${r}-${c}`) ? true : cell === solution[r][c]
        )
      )
    ) {
      setShowModal(true);
    }
  };

  /* ---------- VICTORY & COPY ---------- */
  const copyResult = () => {
    navigator.clipboard.writeText(`I finished the NinaYT Mini in ${elapsed}s!`);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 1500);
  };

  /* ---------- KEYBOARD HANDLER ---------- */
  const handleKey = (key) => {
    if (!selected) return;
    let [r, c] = selected;
    if (blackBoxes.has(`${r}-${c}`) || status[r][c] === true) return;

    if (key === "Backspace") {
      updateCell(r, c, "");
      const [pr, pc] = prevCell(r, c);
      setSelected([pr, pc]);
      return;
    }
    const ch = key.toUpperCase();
    if (/^[A-Z]$/.test(ch)) {
      updateCell(r, c, ch);
      const [nr, nc] = nextCell(r, c);
      setSelected([nr, nc]);
    }
  };

  /* ---------- CELL CLICK ---------- */
  const handleCellClick = (r, c) => {
    if (blackBoxes.has(`${r}-${c}`)) return;
    if (selected?.[0] === r && selected?.[1] === c) {
      setDirection((d) => (d === "across" ? "down" : "across"));
    } else {
      setSelected([r, c]);
    }
  };

  /* ---------- RENDER ---------- */
  return (
    <div
      ref={containerRef}
      className="p-4 flex flex-col items-center gap-4"
      tabIndex={0}
      onKeyDown={(e) => handleKey(e.key)}
    >
      {/* TIMER & TITLE */}
      <h1 className="text-xl font-bold">
        NinaYT Mini Crossword – {Math.floor(elapsed / 60)}m {elapsed % 60}s
      </h1>

      {/* TOOLBAR (dropdown style) */}
      <div className="flex gap-4">
        {/* Check menu */}
        {/* Check menu */}
        <div className="relative" ref={checkMenuRef}>
          <button
            onClick={() => {
              setShowCheckMenu((p) => !p);
              setShowRevealMenu(false);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-full shadow hover:brightness-105"
          >
            ✅ Check
          </button>
          {showCheckMenu && (
            <div className="absolute z-10 bg-white border rounded shadow mt-2 w-36">
              <button
                onClick={() => {
                  checkSquare();
                  setShowCheckMenu(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Check Square
              </button>
              <button
                onClick={() => {
                  checkWord();
                  setShowCheckMenu(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Check Word
              </button>
              <button
                onClick={() => {
                  checkPuzzle();
                  setShowCheckMenu(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Check Puzzle
              </button>
            </div>
          )}
        </div>

        {/* Reveal menu */}
        <div className="relative" ref={revealMenuRef}>
          <button
            onClick={() => {
              setShowRevealMenu((p) => !p);
              setShowCheckMenu(false);
            }}
            className="bg-yellow-500 text-white px-4 py-2 rounded-full shadow hover:brightness-105"
          >
            💡 Reveal
          </button>
          {showRevealMenu && (
            <div className="absolute z-10 bg-white border rounded shadow mt-2 w-36">
              <button
                onClick={() => {
                  revealSquare();
                  setShowRevealMenu(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Reveal Square
              </button>
              <button
                onClick={() => {
                  revealWord();
                  setShowRevealMenu(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Reveal Word
              </button>
              <button
                onClick={() => {
                  revealPuzzle();
                  setShowRevealMenu(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Reveal Puzzle
              </button>
            </div>
          )}
        </div>
      </div>

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

            /* black square */
            if (blackBoxes.has(key))
              return (
                <div
                  key={key}
                  className="bg-black border border-black"
                  style={{ width: CELL, height: CELL }}
                />
              );

            /* typable square */
            const isSel = selected?.[0] === r && selected?.[1] === c;
            const inWord = currentWordCells.has(key);
            const flag = status[r][c]; // null | true | false
            const text = flag === true ? "text-blue-600" : "text-black";
            const ring = isSel ? "outline outline-2 outline-blue-400" : "";
            let bg = "bg-white";
            if (isSel) bg = "bg-yellow-200";
            else if (inWord) bg = "bg-blue-100";

            return (
              <div
                key={key}
                onClick={() => handleCellClick(r, c)}
                className={`relative flex items-center justify-center border border-black ${bg} ${ring} ${text} text-2xl font-semibold select-none cursor-pointer`}
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

      {/* CURRENT CLUE BAR */}
      <div className="w-full max-w-xl mt-4 px-4">
        <div className="bg-blue-100 rounded-xl flex items-center justify-between px-4 py-2 shadow text-gray-800">
          <button
            onClick={() => {
              const curr = getCurrentClueIndex();
              if (curr > 0) {
                goToClue(curr - 1);
              }
            }}
            disabled={getCurrentClueIndex() === 0}
            className="text-2xl font-extrabold mx-2 active:bg-gray-300 rounded transition disabled:opacity-30"
          >
            {"<"}
          </button>

          <div className="flex-1 text-center text-base font-semibold px-2">
            {getCurrentClue()}
          </div>

          <button
            onClick={() => {
              const curr = getCurrentClueIndex();
              if (curr >= 0) {
                const next = (curr + 1) % clueOrder.length;
                goToClue(next);
              }
            }}
            className="text-2xl font-extrabold mx-2 active:bg-gray-300 rounded transition"
          >
            {">"}
          </button>
        </div>
      </div>

      {/* KEYBOARD */}
      <div className="flex flex-col items-center gap-2 mt-4 px-2 w-full max-w-xl">
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

      {/* VICTORY MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-80 text-center space-y-4">
            <h2 className="text-2xl font-bold">🎉 Congratulations!</h2>
            <p>
              You solved the Mini in{" "}
              <span className="font-semibold">{elapsed}s</span>
            </p>

            {/* copy-to-clipboard */}
            <button
              onClick={copyResult}
              className="w-full bg-yellow-400 text-white py-2 rounded-lg shadow hover:brightness-105"
            >
              {copySuccess ? "Copied ✓" : "Copy result"}
            </button>

            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-blue-500 text-white py-2 rounded-lg shadow hover:brightness-105"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
