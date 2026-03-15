import { initialPositions } from "./constants";
import { ChessBoardState, Square } from "./types";

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

const fileMap = ["A", "B", "C", "D", "E", "F", "G", "H"];

export function squareToUci(square: Square): string {
  const { row, col } = parseCoordinate(square);
  const file = fileMap[col - 1].toLowerCase();
  const rank = 9 - row;
  return `${file}${rank}`;
}

export function uciToSquare(uci: string): Square {
  const file = uci[0].toUpperCase();
  const rank = parseInt(uci[1]);
  const col = fileMap.indexOf(file) + 1;
  const row = 9 - rank;
  return `${file}${row}` as Square;
}

function pieceTypeToFenChar(pieceType: string): string {
  const [color, raw] = pieceType.split("_");
  const map: Record<string, string> = {
    king: "k",
    queen: "q",
    rook: "r",
    bishop: "b",
    knight: "n",
    pawn: "p",
  };
  const base = map[raw] || "";
  return color === "w" ? base.toUpperCase() : base;
}

function internalFromStandard(file: string, rank: number): Square {
  const row = 9 - rank;
  return `${file}${row}` as Square;
}

function getPieceMeta(piece: ChessBoardState[Square]) {
  if (!piece) return { type: "", hasMoved: false };
  if (typeof piece === "string") return { type: piece, hasMoved: false };
  return { type: piece.type, hasMoved: !!piece.hasMoved };
}

export function getCastlingRights(pieces: ChessBoardState): string {
  const wk = getPieceMeta(pieces[internalFromStandard("E", 1)]);
  const wrA = getPieceMeta(pieces[internalFromStandard("A", 1)]);
  const wrH = getPieceMeta(pieces[internalFromStandard("H", 1)]);
  const bk = getPieceMeta(pieces[internalFromStandard("E", 8)]);
  const brA = getPieceMeta(pieces[internalFromStandard("A", 8)]);
  const brH = getPieceMeta(pieces[internalFromStandard("H", 8)]);

  let rights = "";
  if (wk.type === "w_king" && !wk.hasMoved) {
    if (wrH.type === "w_rook" && !wrH.hasMoved) rights += "K";
    if (wrA.type === "w_rook" && !wrA.hasMoved) rights += "Q";
  }
  if (bk.type === "b_king" && !bk.hasMoved) {
    if (brH.type === "b_rook" && !brH.hasMoved) rights += "k";
    if (brA.type === "b_rook" && !brA.hasMoved) rights += "q";
  }

  return rights || "-";
}

export function piecesToFen(
  pieces: ChessBoardState,
  colorTurn: "w" | "b",
): string {
  const ranks: string[] = [];

  for (let rank = 8; rank >= 1; rank--) {
    const row = 9 - rank;
    let empty = 0;
    let rankStr = "";

    for (let col = 1; col <= 8; col++) {
      const square = `${fileMap[col - 1]}${row}` as Square;
      const pieceRaw = pieces[square];
      const pieceType =
        typeof pieceRaw === "string" ? pieceRaw : pieceRaw?.type;

      if (!pieceType) {
        empty += 1;
      } else {
        if (empty > 0) {
          rankStr += empty.toString();
          empty = 0;
        }
        rankStr += pieceTypeToFenChar(pieceType);
      }
    }

    if (empty > 0) rankStr += empty.toString();
    ranks.push(rankStr);
  }

  const board = ranks.join("/");
  const castling = getCastlingRights(pieces);
  return `${board} ${colorTurn} ${castling} - 0 1`;
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
