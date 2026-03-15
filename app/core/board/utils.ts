import { initialPositions } from "./constants";

export function getBackgroundColor(
  row: number,
  col: number,
  isActive: boolean,
) {
  const isRowEven = row % 2 === 0;
  const isColumnEven = col % 2 === 0;

  if (isActive) {
    return "bg-yellow-200";
  }

  if (!isRowEven && !isColumnEven) return "bg-slate-200";
  if (isRowEven && isColumnEven) return "bg-slate-200";

  return "bg-slate-600";
}

export function getCoordinate(row: number, col: number) {
  const colMap = ["A", "B", "C", "D", "E", "F", "G", "H"];
  return { pos: { col, row }, coordinate: `${colMap[col - 1]}${row}` };
}

export function parseCoordinate(coordinate: string) {
  const colMap = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const col = colMap.indexOf(coordinate[0]) + 1;
  const row = parseInt(coordinate[1]);
  return { col, row };
}

export const getPieceInitialPositions = (
  playerColor: "w" | "b",
  gameId: number = 0,
) => {
  const swap = (piece: string) =>
    piece.includes("w_")
      ? piece.replace("w_", "b_")
      : piece.includes("b_")
        ? piece.replace("b_", "w_")
        : piece;

  return Object.fromEntries(
    Object.entries(initialPositions).map(([pos, piece]) => {
      if (!piece) return [pos, ""];
      let newPiece = playerColor === "w" ? swap(piece as string) : piece;
      return [
        pos,
        { type: newPiece, id: `${newPiece}-${pos}-${gameId}`, hasMoved: false },
      ];
    }),
  );
};
