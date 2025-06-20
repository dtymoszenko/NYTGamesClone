// Mini.jsx
// ---------------------------------------------------------------------------
// 5×5 crossword grid with black boxes, automatic clue numbers, answer checks,
// blue-text locks for correct letters, red slashes for wrong letters, a timer,
// a victory modal (with copy-to-clipboard), and a Wordle-style keyboard.
// ---------------------------------------------------------------------------

import { useState, useMemo, useEffect, useRef } from "react";

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

// empty strings in solution correspond to black squares above
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
  const [selected, setSelected] = useState(null); // active [row,col]
  const [direction, setDirection] = useState("across"); // "across" | "down"

  const [elapsed, setElapsed] = useState(0); // timer (sec)
  const [showModal, setShowModal] = useState(false); // modal flag
  const [copied, setCopied] = useState(false); // copy-feedback

  const timerRef = useRef(null); // keep interval id so we can clear it
  const containerRef = useRef(null); // auto-focus for key input

  /* ---------- START / STOP TIMER ---------- */
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current); // cleanup
  }, []);

  /* ---------- AUTO-FOCUS & highlight first cell ---------- */
  useEffect(() => {
    containerRef.current?.focus(); // immediate typing

    // highlight first non-black square (1-Across)
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (!blackBoxes.has(`${r}-${c}`)) {
          setSelected([r, c]);
          return;
        }
      }
    }
  }, []);

  /* ---------- AUTO-NUMBER CLUES ---------- */
  const clueNumbers = useMemo(() => {
    let across = 1,
      down = 1;
    const map = {}; // { "r-c": number }

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const key = `${r}-${c}`;
        if (blackBoxes.has(key)) continue;

        const startsAcross = c === 0 || blackBoxes.has(`${r}-${c - 1}`);
        const startsDown = r === 0 || blackBoxes.has(`${r - 1}-${c}`);

        if (startsAcross) {
          map[key] = across++;
          if (startsDown) down++;
        } else if (startsDown) {
          map[key] = down++;
        }
      }
    }
    return map;
  }, []);

  /* ---------- WORD HIGHLIGHT (across / down) ---------- */
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

  /* ---------- CURSOR MOVEMENT HELPERS ---------- */
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

  /* ---------- EVENT HANDLERS ---------- */
  const handleCellClick = (r, c) => {
    if (blackBoxes.has(`${r}-${c}`)) return;

    if (selected?.[0] === r && selected?.[1] === c) {
      setDirection((d) => (d === "across" ? "down" : "across"));
    } else {
      setSelected([r, c]);
    }
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

  /* ---------- CHECK ANSWERS & TRIGGER WIN ---------- */
  const checkAnswers = () => {
    const allCorrectRow = (row, r) =>
      row.every((_, c) =>
        blackBoxes.has(`${r}-${c}`) ? true : board[r][c] === solution[r][c]
      );

    setStatus((prev) =>
      prev.map((row, r) =>
        row.map((_, c) => {
          const k = `${r}-${c}`;
          if (blackBoxes.has(k)) return null;
          return board[r][c] && board[r][c] === solution[r][c];
        })
      )
    );

    if (board.every(allCorrectRow)) {
      clearInterval(timerRef.current); // stop timer
      setShowModal(true); // show win modal
    }
  };

  /* ---------- COPY STRING TO CLIPBOARD ---------- */
  const handleCopy = () => {
    const secs = elapsed % 60;
    const mins = Math.floor(elapsed / 60);
    const text = `I finished the NinaYT Mini in ${mins}m ${secs}s.`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500); // reset label
    });
  };

  /* ---------- RENDER ---------- */
  return (
    <div
      ref={containerRef} /* auto-focus for typing */
      className="p-4 flex flex-col items-center gap-6"
      tabIndex={0}
      onKeyDown={(e) => handleKey(e.key)}
    >
      <h1 className="text-2xl font-bold">Mini Crossword</h1>

      {/* GRID */}
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
            const inWord = currentWordCells.has(key);
            const flag = status[r][c];
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

      {/* TIMER DISPLAY */}
      <p className="text-gray-600 text-sm">
        Time: {Math.floor(elapsed / 60)}m {elapsed % 60}s
      </p>

      {/* VICTORY MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-80 text-center space-y-4">
            <h2 className="text-2xl font-bold">🎉 Congratulations!</h2>
            <p>
              You solved the Mini in{" "}
              <span className="font-semibold">
                {Math.floor(elapsed / 60)}m {elapsed % 60}s
              </span>
            </p>

            {/* COPY TO CLIPBOARD */}
            <button
              onClick={handleCopy}
              className="w-full bg-green-500 text-white py-2 rounded-lg shadow hover:brightness-105 transition"
            >
              {copied ? "Copied!" : "Copy time to clipboard"}
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
