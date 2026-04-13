export default function SudokuCell({
  value,
  notes = [],
  row,
  col,
  isGiven,
  isSelected,
  isRelated,
  isSameNum,
  isHint,
  isError,
  onSelect,
  onInput,
}) {
  const handleKeyDown = (e) => {
    if (isGiven) return;

    if (e.key >= "1" && e.key <= "9") {
      e.preventDefault();
      onInput(Number(e.key));
    } else if (["Backspace", "Delete", "0"].includes(e.key)) {
      e.preventDefault();
      onInput(0);
    }
  };

  let cls = "cell";
  if (isGiven) cls += " cell-given";
  else if (isError) cls += " cell-user cell-error";
  else if (isHint) cls += " cell-hint";
  else if (value !== 0) cls += " cell-user";

  if (isSelected) cls += " cell-selected";
  else if (isSameNum) cls += " cell-same-num";
  else if (isRelated) cls += " cell-related";

  return (
    <div
      className={cls}
      data-row={row}
      data-col={col}
      tabIndex={isGiven ? -1 : 0}
      role="gridcell"
      aria-label={`Row ${row + 1}, col ${col + 1}${value ? `, value ${value}` : ", empty"}`}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
    >
      {value !== 0 ? (
        value
      ) : notes.length > 0 ? (
        <div className="notes-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <span key={n} className="note-item">
              {notes.includes(n) ? n : ""}
            </span>
          ))}
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

// export default function SudokuCell({
//   value, row, col,
//   isGiven, isSelected, isRelated, isSameNum, isHint, isError,
//   onSelect, onInput,
// }) {
//   const handleKeyDown = (e) => {
//     if (isGiven) return;
//     if (e.key >= "1" && e.key <= "9") {
//       e.preventDefault();
//       onInput(Number(e.key));
//     } else if (["Backspace", "Delete", "0"].includes(e.key)) {
//       e.preventDefault();
//       onInput(0);
//     } else if (e.key === "ArrowUp")    { e.preventDefault(); /* parent could handle nav */ }
//     else if (e.key === "ArrowDown")    { e.preventDefault(); }
//     else if (e.key === "ArrowLeft")    { e.preventDefault(); }
//     else if (e.key === "ArrowRight")   { e.preventDefault(); }
//   };

//   let cls = "cell";
//   if (isGiven)                              cls += " cell-given";
//   else if (isError)                         cls += " cell-user cell-error";
//   else if (isHint)                          cls += " cell-hint";
//   else if (value !== 0)                     cls += " cell-user";

//   if (isSelected)      cls += " cell-selected";
//   else if (isSameNum)  cls += " cell-same-num";
//   else if (isRelated)  cls += " cell-related";

//   return (
//     <div
//       className={cls}
//       data-row={row}
//       data-col={col}
//       tabIndex={isGiven ? -1 : 0}
//       role="gridcell"
//       aria-label={`Row ${row + 1}, col ${col + 1}${value ? `, value ${value}` : ", empty"}`}
//       onClick={onSelect}
//       onKeyDown={handleKeyDown}
//     >
//       {value !== 0 ? value : ""}
//     </div>
//   );
// }