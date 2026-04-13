import SudokuCell from "./SudokuCell";

export default function SudokuGrid({
  board,
  originalBoard,
  selectedCell,
  onSelectCell,
  onInput,
}) {
  if (!board || board.length === 0) {
  return <div style={{ color: "white", padding: "20px" }}>Board not loaded</div>;
}

  const [selRow, selCol] = selectedCell ?? [-1, -1];
  const selectedValue = selectedCell ? board[selRow][selCol]?.value : 0;

  return (
    <div className="grid" role="grid" aria-label="Sudoku board">
      {board.map((row, r) =>
        row.map((cell, c) => {
          const isGiven    = originalBoard?.[r]?.[c] !== 0;
          const isSelected = r === selRow && c === selCol;

          const isRelated =
            selectedCell &&
            !isSelected &&
            (r === selRow ||
              c === selCol ||
              (Math.floor(r / 3) === Math.floor(selRow / 3) &&
                Math.floor(c / 3) === Math.floor(selCol / 3)));

          const isSameNum =
            !!selectedValue &&
            selectedValue !== 0 &&
            cell.value === selectedValue &&
            !isSelected;

          return (
            <SudokuCell
              key={`${r}-${c}`}
              value={cell.value}
              row={r}
              col={c}
              isGiven={isGiven}
              isSelected={isSelected}
              isRelated={isRelated}
              isSameNum={isSameNum}
              isHint={cell.isHint}
              isError={cell.isError}
              onSelect={() => onSelectCell([r, c])}
              onInput={(num) => onInput(r, c, num)}
            />
          );
        })
      )}
    </div>
  );
}