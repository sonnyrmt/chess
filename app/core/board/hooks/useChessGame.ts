import { useState, useEffect } from "react";
import { ChessBoardState, Square } from "../types";
import { getPieceInitialPositions, parseCoordinate } from "../utils";
import { isKingInCheck, isCheckmate } from "@/app/components/piece/rules";

export const useChessGame = (playerPieceColor: "w" | "b") => {
  const [colorTurn, setColorTurn] = useState<"w" | "b">("w");
  const init = getPieceInitialPositions(playerPieceColor);
  const [pieces, setPieces] = useState<ChessBoardState>(init);
  const [active, setActive] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);
  const [isCheck, setIsCheck] = useState(false);
  const [isMate, setIsMate] = useState(false);
  const [gameId, setGameId] = useState(0);
  const [promotionPending, setPromotionPending] = useState<{ from: Square, to: Square, color: string } | null>(null);

  useEffect(() => {
    setIsCheck(isKingInCheck(colorTurn, pieces, playerPieceColor));
    setIsMate(isCheckmate(colorTurn, pieces, playerPieceColor));
  }, [colorTurn, pieces, playerPieceColor]);

  const handleMove = (to: Square) => {
    if (!active || isMate) return;

    const piece = pieces[active];
    if (!piece) return;

    const newPieces = { ...pieces };
    const pieceData = typeof piece === "string" ? { type: piece, id: `${piece}-${active}-${gameId}` } : piece;
    
    if (pieceData.type.includes("king")) {
      const fromCoord = parseCoordinate(active);
      const toCoord = parseCoordinate(to);
      if (Math.abs(fromCoord.col - toCoord.col) === 2) {
        const row = fromCoord.row;
        if (toCoord.col === 7) {
          const rook = newPieces[`H${row}` as Square];
          delete newPieces[`H${row}` as Square];
          newPieces[`F${row}` as Square] = typeof rook === "string" ? { type: rook, id: `rook-${row}-F`, hasMoved: true } : { ...rook!, hasMoved: true };
        } else if (toCoord.col === 3) {
          const rook = newPieces[`A${row}` as Square];
          delete newPieces[`A${row}` as Square];
          newPieces[`D${row}` as Square] = typeof rook === "string" ? { type: rook, id: `rook-${row}-D`, hasMoved: true } : { ...rook!, hasMoved: true };
        }
      }
    }

    delete newPieces[active];
    newPieces[to] = { ...pieceData, hasMoved: true };

    if (pieceData.type.includes("pawn")) {
       const { row } = parseCoordinate(to);
       if ((pieceData.type.startsWith("w") && row === 1) || (pieceData.type.startsWith("b") && row === 8)) {
          setPromotionPending({ from: active, to, color: pieceData.type.startsWith("w") ? "w" : "b" });
       }
    }

    setPieces(newPieces);
    setActive(null);
    setPossibleMoves([]);
    setColorTurn(colorTurn === "w" ? "b" : "w");
  };

  const resetGame = () => {
    const nextGameId = gameId + 1;
    setGameId(nextGameId);
    setPieces(getPieceInitialPositions(playerPieceColor, nextGameId));
    setColorTurn("w");
    setActive(null);
    setPossibleMoves([]);
    setIsCheck(false);
    setIsMate(false);
  };

  useEffect(() => {
    if (isMate) {
      setTimeout(() => {
        alert("¡Jaque Mate!");
        resetGame();
      }, 500);
    }
  }, [isMate]);

  const promotePawn = (type: string) => {
    if (!promotionPending) return;
    const { to, color } = promotionPending;
    const newPieces = { ...pieces };
    newPieces[to] = { type: `${color}_${type}`, id: `${color}_${type}-${to}-${gameId}`, hasMoved: true };
    setPieces(newPieces);
    setPromotionPending(null);
  };

  return {
    colorTurn,
    setColorTurn,
    pieces,
    setPieces,
    active,
    setActive,
    possibleMoves,
    setPossibleMoves,
    handleMove,
    resetGame,
    promotePawn,
    promotionPending,
    playerPieceColor,
    isCheck,
    isMate,
  };
};
