import { ChessBoardState, Square, PieceData } from "@/app/core/board/types";
import {
  getCoordinate,
  getPieceInitialPositions,
  parseCoordinate,
} from "@/app/core/board/utils";

export const handlePieceMovement = (
  piece: string | PieceData,
  coordinate: Square,
  pieces: ChessBoardState,
  colorTurn: "w" | "b",
  playerPieceColor: "w" | "b",
  checkLegal: boolean = true,
): Square[] => {
  const init = getPieceInitialPositions(playerPieceColor);
  const pieceType = typeof piece === "string" ? piece : piece.type;

  let moves: Square[] = [];

  switch (pieceType) {
    case `${colorTurn}_pawn`:
      moves = handlePawnMovement(
        pieceType,
        coordinate,
        pieces,
        colorTurn,
        init,
      ) as Square[];
      break;
    case `${colorTurn}_king`:
      moves = handleKingMovement(coordinate, pieces, colorTurn, checkLegal);
      break;
    case `${colorTurn}_queen`:
      moves = handleQueenMovement(coordinate, pieces, colorTurn);
      break;
    case `${colorTurn}_bishop`:
      moves = handleBishopMovement(coordinate, pieces, colorTurn);
      break;
    case `${colorTurn}_knight`:
      moves = handleKnightMovement(coordinate, pieces, colorTurn);
      break;
    case `${colorTurn}_rook`:
      moves = handleRookMovement(coordinate, pieces, colorTurn);
      break;
    default:
      moves = [];
      break;
  }

  if (!checkLegal) return moves;

  return moves.filter((move) => {
    const simulatedPieces = { ...pieces };
    simulatedPieces[move] = piece;
    delete simulatedPieces[coordinate];

    return !isKingInCheck(colorTurn, simulatedPieces, playerPieceColor);
  });
};

export const isKingInCheck = (
  color: "w" | "b",
  pieces: ChessBoardState,
  playerPieceColor: "w" | "b",
): boolean => {
  const kingType = `${color}_king`;
  let kingPos: Square | null = null;

  for (const [pos, p] of Object.entries(pieces)) {
    const pType = typeof p === "string" ? p : p?.type;
    if (pType === kingType) {
      kingPos = pos as Square;
      break;
    }
  }

  if (!kingPos) return false;

  const opponentColor = color === "w" ? "b" : "w";
  for (const [pos, p] of Object.entries(pieces)) {
    const pType = typeof p === "string" ? p : p?.type;
    if (pType?.startsWith(opponentColor)) {
      const opponentMoves = handlePieceMovement(
        p as PieceData | string,
        pos as Square,
        pieces,
        opponentColor,
        playerPieceColor,
        false,
      );
      if (opponentMoves?.includes(kingPos)) return true;
    }
  }

  return false;
};

export const isCheckmate = (
  color: "w" | "b",
  pieces: ChessBoardState,
  playerPieceColor: "w" | "b",
): boolean => {
  if (!isKingInCheck(color, pieces, playerPieceColor)) return false;

  for (const [pos, p] of Object.entries(pieces)) {
    const pType = typeof p === "string" ? p : p?.type;
    if (pType?.startsWith(color)) {
      const legalMoves = handlePieceMovement(
        p as PieceData | string,
        pos as Square,
        pieces,
        color,
        playerPieceColor,
        true,
      );
      if (legalMoves.length > 0) return false;
    }
  }

  return true;
};

const getSlidingMoves = (
  coordinate: Square,
  pieces: ChessBoardState,
  colorTurn: "w" | "b",
  directions: { dr: number; dc: number }[],
) => {
  const { row, col } = parseCoordinate(coordinate);
  const moves: Square[] = [];
  const enemyPrefix = colorTurn === "w" ? "b_" : "w_";

  directions.forEach(({ dr, dc }) => {
    for (let i = 1; i < 8; i++) {
      const nr = row + dr * i;
      const nc = col + dc * i;

      if (nr < 1 || nr > 8 || nc < 1 || nc > 8) break;

      const { coordinate: nCoord } = getCoordinate(nr, nc);
      const targetPieceRaw = pieces[nCoord as Square];
      const targetPieceType =
        typeof targetPieceRaw === "string"
          ? targetPieceRaw
          : targetPieceRaw?.type;

      if (!targetPieceType) {
        moves.push(nCoord as Square);
      } else {
        if (targetPieceType.startsWith(enemyPrefix)) {
          moves.push(nCoord as Square);
        }
        break;
      }
    }
  });

  return moves;
};

const handleRookMovement = (
  coordinate: Square,
  pieces: ChessBoardState,
  colorTurn: "w" | "b",
) => {
  const directions = [
    { dr: 1, dc: 0 },
    { dr: -1, dc: 0 },
    { dr: 0, dc: 1 },
    { dr: 0, dc: -1 },
  ];
  return getSlidingMoves(coordinate, pieces, colorTurn, directions);
};

const handleBishopMovement = (
  coordinate: Square,
  pieces: ChessBoardState,
  colorTurn: "w" | "b",
) => {
  const directions = [
    { dr: 1, dc: 1 },
    { dr: 1, dc: -1 },
    { dr: -1, dc: 1 },
    { dr: -1, dc: -1 },
  ];
  return getSlidingMoves(coordinate, pieces, colorTurn, directions);
};

const handlePawnMovement = (
  piece: string,
  coordinate: Square,
  pieces: ChessBoardState,
  colorTurn: "w" | "b",
  init: ChessBoardState,
) => {
  const currentPawnPosition = parseCoordinate(coordinate);
  const initPieceRaw = init[coordinate];
  const initPieceType =
    typeof initPieceRaw === "string" ? initPieceRaw : initPieceRaw?.type;
  const isInitialPosition = initPieceType === piece;

  const posibleMovements: Square[] = [];
  const limit = isInitialPosition ? 2 : 1;

  for (let i = 1; i <= limit; i++) {
    const nextRow =
      colorTurn === "w"
        ? currentPawnPosition.row - i
        : currentPawnPosition.row + i;

    if (nextRow < 1 || nextRow > 8) break;

    const { coordinate: nextCoord } = getCoordinate(
      nextRow,
      currentPawnPosition.col,
    );
    const occupiedRaw = pieces[nextCoord as Square];
    const occupiedType =
      typeof occupiedRaw === "string" ? occupiedRaw : occupiedRaw?.type;

    if (!occupiedType) {
      posibleMovements.push(nextCoord as Square);
    } else {
      break;
    }
  }

  const diagonalCols = [
    currentPawnPosition.col - 1,
    currentPawnPosition.col + 1,
  ];
  const nextPawnRow =
    colorTurn === "w"
      ? currentPawnPosition.row - 1
      : currentPawnPosition.row + 1;

  if (nextPawnRow >= 1 && nextPawnRow <= 8) {
    diagonalCols.forEach((col) => {
      if (col >= 1 && col <= 8) {
        const { coordinate: diagCoord } = getCoordinate(nextPawnRow, col);
        const targetPieceRaw = pieces[diagCoord as Square];
        const targetPieceType =
          typeof targetPieceRaw === "string"
            ? targetPieceRaw
            : targetPieceRaw?.type;
        const enemyPrefix = colorTurn === "w" ? "b_" : "w_";

        if (targetPieceType && targetPieceType.startsWith(enemyPrefix)) {
          posibleMovements.push(diagCoord as Square);
        }
      }
    });
  }

  return posibleMovements;
};

const handleQueenMovement = (
  coordinate: Square,
  pieces: ChessBoardState,
  colorTurn: "w" | "b",
) => {
  const rookDirections = [
    { dr: 1, dc: 0 },
    { dr: -1, dc: 0 },
    { dr: 0, dc: 1 },
    { dr: 0, dc: -1 },
  ];
  const bishopDirections = [
    { dr: 1, dc: 1 },
    { dr: 1, dc: -1 },
    { dr: -1, dc: 1 },
    { dr: -1, dc: -1 },
  ];
  return getSlidingMoves(coordinate, pieces, colorTurn, [
    ...rookDirections,
    ...bishopDirections,
  ]);
};

const handleKnightMovement = (
  coordinate: Square,
  pieces: ChessBoardState,
  colorTurn: "w" | "b",
) => {
  const { row, col } = parseCoordinate(coordinate);
  const moves: Square[] = [];
  const enemyPrefix = colorTurn === "w" ? "b_" : "w_";

  const potential = [
    { dr: 2, dc: 1 },
    { dr: 2, dc: -1 },
    { dr: -2, dc: 1 },
    { dr: -2, dc: -1 },
    { dr: 1, dc: 2 },
    { dr: 1, dc: -2 },
    { dr: -1, dc: 2 },
    { dr: -1, dc: -2 },
  ];

  potential.forEach(({ dr, dc }) => {
    const nr = row + dr;
    const nc = col + dc;

    if (nr >= 1 && nr <= 8 && nc >= 1 && nc <= 8) {
      const { coordinate: nCoord } = getCoordinate(nr, nc);
      const targetPieceRaw = pieces[nCoord as Square];
      const targetPieceType =
        typeof targetPieceRaw === "string"
          ? targetPieceRaw
          : targetPieceRaw?.type;

      if (!targetPieceType || targetPieceType.startsWith(enemyPrefix)) {
        moves.push(nCoord as Square);
      }
    }
  });

  return moves;
};

const handleKingMovement = (
  coordinate: Square,
  pieces: ChessBoardState,
  colorTurn: "w" | "b",
  checkLegal: boolean = true,
) => {
  const { row, col } = parseCoordinate(coordinate);
  const moves: Square[] = [];
  const enemyPrefix = colorTurn === "w" ? "b_" : "w_";

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;

      const nr = row + dr;
      const nc = col + dc;

      if (nr >= 1 && nr <= 8 && nc >= 1 && nc <= 8) {
        const { coordinate: nCoord } = getCoordinate(nr, nc);
        const targetPieceRaw = pieces[nCoord as Square];
        const targetPieceType =
          typeof targetPieceRaw === "string"
            ? targetPieceRaw
            : targetPieceRaw?.type;

        if (!targetPieceType || targetPieceType.startsWith(enemyPrefix)) {
          moves.push(nCoord as Square);
        }
      }
    }
  }

  if (!checkLegal) return moves;

  const pieceRaw = pieces[coordinate];
  const pieceData = typeof pieceRaw === "string" ? null : pieceRaw;

  if (pieceData && !pieceData.hasMoved && !isKingInCheck(colorTurn, pieces, colorTurn === "w" ? "w" : "b")) {
    const rowStr = row.toString();
    

    const rookK = pieces[`H${rowStr}` as Square];
    const rookKData = typeof rookK === "string" ? null : rookK;
    if (rookKData && !rookKData.hasMoved && rookKData.type === `${colorTurn}_rook`) {
      if (!pieces[`F${rowStr}` as Square] && !pieces[`G${rowStr}` as Square]) {
        const passingCheck = [ `F${rowStr}`, `G${rowStr}` ].some(sq => {
           const simulated = { ...pieces };
           simulated[sq as Square] = pieceRaw;
           delete simulated[coordinate];
           return isKingInCheck(colorTurn, simulated, colorTurn === "w" ? "w" : "b");
        });
        if (!passingCheck) moves.push(`G${rowStr}` as Square);
      }
    }


    const rookQ = pieces[`A${rowStr}` as Square];
    const rookQData = typeof rookQ === "string" ? null : rookQ;
    if (rookQData && !rookQData.hasMoved && rookQData.type === `${colorTurn}_rook`) {
      if (!pieces[`B${rowStr}` as Square] && !pieces[`C${rowStr}` as Square] && !pieces[`D${rowStr}` as Square]) {
         const passingCheck = [ `C${rowStr}`, `D${rowStr}` ].some(sq => {
           const simulated = { ...pieces };
           simulated[sq as Square] = pieceRaw;
           delete simulated[coordinate];
           return isKingInCheck(colorTurn, simulated, colorTurn === "w" ? "w" : "b");
        });
        if (!passingCheck) moves.push(`C${rowStr}` as Square);
      }
    }
  }

  return moves;
};
