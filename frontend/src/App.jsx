import { useEffect, useState, useCallback, useRef } from "react";
import { fetchNewGame, fetchHint } from "./services/api";
import SudokuGrid from "./components/SudokuGrid";
import "./App.css";

const DIFFICULTIES = ["easy", "medium", "hard", "expert", "master"];

function formatTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

// board[r][c] = {
//   value: 0-9,
//   notes: [],
//   isHint: bool,
//   isError: bool
// }
function wrapBoard(rawBoard) {
  return rawBoard.map((row) =>
    row.map((v) => ({
      value: v,
      notes: [],
      isHint: false,
      isError: false,
    }))
  );
}

export default function App() {
  const [board,         setBoard]         = useState([]);   // wrapped board
  const [originalBoard, setOriginalBoard] = useState([]);   // raw 0-9 board (given cells)
  const [level,         setLevel]         = useState("easy");
  const [loading,       setLoading]       = useState(false);
  const [hintsUsed,     setHintsUsed]     = useState(0);
  const [mistakes,      setMistakes]      = useState(0);
  const [score,         setScore]         = useState(0);
  const [timer,         setTimer]         = useState(0);
  const [timerOn,       setTimerOn]       = useState(false);
  const [selectedCell,  setSelectedCell]  = useState(null);
  const [pencilMode,    setPencilMode]    = useState(false);
  const [theme,         setTheme]         = useState("dark");
  const [solved,        setSolved]        = useState(false);

  const timerRef = useRef(null);

  // Sync theme to <html data-theme>
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Timer tick
  useEffect(() => {
    clearInterval(timerRef.current);
    if (timerOn && !solved) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerOn, solved]);

  // Validate a single cell against current board
  const isValidCell = useCallback((b, row, col, num) => {
    if (num === 0) return true;
    for (let i = 0; i < 9; i++) {
      if (i !== col && b[row][i].value === num) return false;
      if (i !== row && b[i][col].value === num) return false;
    }
    const br = Math.floor(row / 3) * 3;
    const bc = Math.floor(col / 3) * 3;
    for (let r = br; r < br + 3; r++) {
      for (let c = bc; c < bc + 3; c++) {
        if ((r !== row || c !== col) && b[r][c].value === num) return false;
      }
    }
    return true;
  }, []);

  const isBoardSolved = (b) =>
    b.every((row) => row.every((cell) => cell.value !== 0 && !cell.isError));

  const loadGame = useCallback(async (selectedLevel) => {
    clearInterval(timerRef.current);
    setLoading(true);
    setSolved(false);
    setTimer(0);
    setMistakes(0);
    setHintsUsed(0);
    setScore(0);
    setSelectedCell(null);
    setTimerOn(false);

    try {
      const data = await fetchNewGame(selectedLevel);
      const raw = data.board; // number[][]
      setOriginalBoard(raw.map((r) => [...r]));
      setBoard(wrapBoard(raw));
      setTimerOn(true);
    } catch (err) {
      console.error("Failed to load game:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGame("easy");
  }, [loadGame]);

  const handleCellInput = useCallback(
  (row, col, num) => {
    if (!board.length) return;
    if (originalBoard[row][col] !== 0) return;

    const next = board.map((r) =>
      r.map((c) => ({
        ...c,
        notes: [...c.notes],
      }))
    );

    // Pencil mode
    if (pencilMode) {
      if (num === 0) {
        next[row][col].notes = [];
      } else if (next[row][col].value === 0) {
        const notes = next[row][col].notes;

        if (notes.includes(num)) {
          next[row][col].notes = notes.filter((n) => n !== num);
        } else {
          next[row][col].notes = [...notes, num].sort((a, b) => a - b);
        }
      }

      setBoard(next);
      return;
    }

    // Normal mode
    next[row][col].value = num;
    next[row][col].notes = [];
    next[row][col].isHint = false;
    next[row][col].isError = num !== 0 && !isValidCell(next, row, col, num);

    if (next[row][col].isError) {
      setMistakes((m) => m + 1);
    } else if (num !== 0) {
      setScore((s) => s + 10);
    }

    setBoard(next);

    if (isBoardSolved(next)) {
      setSolved(true);
      setTimerOn(false);
      setScore((s) => s + Math.max(0, 500 - timer * 2 + (3 - hintsUsed) * 50));
    }
  },
  [board, originalBoard, isValidCell, timer, hintsUsed, pencilMode]
);

  // const handleCellInput = useCallback(
  //   (row, col, num) => {
  //     if (!board.length) return;
  //     if (originalBoard[row][col] !== 0) return; // given — immutable

  //     const next = board.map((r) => r.map((c) => ({ ...c })));
  //     next[row][col].value   = num;
  //     next[row][col].isHint  = false;
  //     next[row][col].isError = num !== 0 && !isValidCell(next, row, col, num);

  //     if (next[row][col].isError) {
  //       setMistakes((m) => m + 1);
  //     } else if (num !== 0) {
  //       setScore((s) => s + 10);
  //     }

  //     setBoard(next);

  //     if (isBoardSolved(next)) {
  //       setSolved(true);
  //       setTimerOn(false);
  //       setScore((s) => s + Math.max(0, 500 - timer * 2 + (3 - hintsUsed) * 50));
  //     }
  //   },
  //   [board, originalBoard, isValidCell, timer, hintsUsed]
  // );

  const handleHint = async () => {
    if (hintsUsed >= 3 || !board.length) return;
    try {
      const flatBoard = board.map((r) => r.map((c) => c.value));
      const data = await fetchHint(flatBoard, hintsUsed);
      if (!data.hint_available) return;

      const next = board.map((r) => r.map((c) => ({ ...c })));
      // next[data.row][data.col] = { value: data.value, isHint: true, isError: false };
      next[data.row][data.col] = {
  value: data.value,
  notes: [],
  isHint: true,
  isError: false,
};
      setBoard(next);
      setHintsUsed(data.hints_used);
      setScore((s) => Math.max(0, s - 30));

      if (isBoardSolved(next)) {
        setSolved(true);
        setTimerOn(false);
      }
    } catch (e) {
      console.error("Hint error", e);
    }
  };

  const handleErase = () => {
    if (!selectedCell) return;
    const [r, c] = selectedCell;
    handleCellInput(r, c, 0);
  };

  const handleNumPad = (num) => {
    if (!selectedCell) return;
    const [r, c] = selectedCell;
    handleCellInput(r, c, num);
  };

  const handleDiffChange = (d) => {
    setLevel(d);
    loadGame(d);
  };

  return (
    <>
      <div className="stars-bg" />

      <div className="app">
        {/* ── Header ── */}
        <div className="header">
          <div className="header-title">SudokuSense</div>
          <div className="header-right">
            <span className="score-display">{score}</span>
            <span className="theme-label">{theme === "dark" ? "🌙" : "☀️"}</span>
            <button
              className="theme-toggle"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              aria-label="Toggle theme"
            />
          </div>
        </div>

        {/* ── Difficulty tabs ── */}
        <div className="difficulty-bar">
          <span className="diff-label">Difficulty:</span>
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              className={`diff-btn${level === d ? " active" : ""}`}
              onClick={() => handleDiffChange(d)}
            >
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Main layout ── */}
        <div className="main-content">

          {/* Left: Grid */}
          <div className="grid-wrapper">
            <div className="grid-container">
              {loading ? (
                <div className="loading-overlay">
                  <div className="spinner" />
                </div>
              ) : (
                <SudokuGrid
                  board={board}
                  originalBoard={originalBoard}
                  selectedCell={selectedCell}
                  onSelectCell={setSelectedCell}
                  onInput={handleCellInput}
                />
              )}
            </div>
          </div>

          {/* Right: Controls */}
          <div className="side-panel">
            {/* Stats */}
            <div className="stats-row">
              <div className="stat-item">
                <span className="stat-label">Mistakes</span>
                <div className="mistakes-dots">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className={`mistake-dot${i < mistakes ? " filled" : ""}`} />
                  ))}
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-label">Time</span>
                <span className="stat-value">{formatTime(timer)}</span>
              </div>
            </div>

            {/* Tools */}
            <div className="tool-row">
              <button className="tool-btn" onClick={handleHint} title="Get a hint">
                {hintsUsed < 3 && <span className="hint-badge">{3 - hintsUsed}</span>}
                <span className="tool-icon">🧪</span>
                <span className="tool-label">Hint</span>
              </button>

              <button
                className={`tool-btn${pencilMode ? " active-tool" : ""}`}
                onClick={() => setPencilMode((p) => !p)}
                title="Pencil mode"
              >
                <span className="tool-icon">✏️</span>
                <span className="tool-label">Pencil: {pencilMode ? "On" : "Off"}</span>
              </button>

              <button className="tool-btn" onClick={handleErase} title="Erase cell">
                <span className="tool-icon">⬜</span>
                <span className="tool-label">Erase</span>
              </button>

              <button
                className="tool-btn"
                onClick={handleErase}
                title="Undo last entry"
              >
                <span className="tool-icon">↩️</span>
                <span className="tool-label">Undo</span>
              </button>
            </div>

            {/* Number pad */}
            <div className="numpad">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <button key={n} className="num-btn" onClick={() => handleNumPad(n)}>
                  {n}
                </button>
              ))}
            </div>

            {/* New game */}
            <button className="new-game-btn" onClick={() => loadGame(level)}>
              Start New Game
            </button>

           
          </div>
        </div>
      </div>

      {/* Solved modal */}
      {solved && (
        <div className="modal-overlay" onClick={() => setSolved(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>🎉 Solved!</h2>
            <p>
              Time: {formatTime(timer)} · Score: {score} · Mistakes: {mistakes}/3
            </p>
            <button className="new-game-btn" onClick={() => loadGame(level)}>
              Play Again
            </button>
          </div>
        </div>
      )}
    </>
  );
}