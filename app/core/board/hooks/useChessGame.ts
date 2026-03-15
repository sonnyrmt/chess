import { useState, useEffect, useRef } from "react";
import { ChessBoardState, Square } from "../types";
import {
  getPieceInitialPositions,
  parseCoordinate,
  piecesToFen,
  uciToSquare,
} from "../utils";
import { isKingInCheck, isCheckmate } from "@/app/components/piece/rules";

export const useChessGame = (
  playerPieceColor: "w" | "b",
  engineDepth: number = 10,
  aiEnabled: boolean = true,
) => {
  const [colorTurn, setColorTurn] = useState<"w" | "b">("w");
  const init = getPieceInitialPositions(playerPieceColor);
  const [pieces, setPieces] = useState<ChessBoardState>(init);
  const [active, setActive] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);
  const [isCheck, setIsCheck] = useState(false);
  const [isMate, setIsMate] = useState(false);
  const [gameId, setGameId] = useState(0);
  const [promotionPending, setPromotionPending] = useState<{ from: Square, to: Square, color: string } | null>(null);
  const engineRef = useRef<any>(null);
  const engineReadyRef = useRef(false);
  const engineThinkingRef = useRef(false);
  const pendingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameIdRef = useRef(0);
  const engineRequestGameIdRef = useRef<number | null>(null);
  const piecesRef = useRef(pieces);
  const colorTurnRef = useRef(colorTurn);
  const isMateRef = useRef(isMate);

  useEffect(() => {
    gameIdRef.current = gameId;
    piecesRef.current = pieces;
    colorTurnRef.current = colorTurn;
    setIsCheck(isKingInCheck(colorTurn, pieces, playerPieceColor));
    setIsMate(isCheckmate(colorTurn, pieces, playerPieceColor));
  }, [colorTurn, pieces, playerPieceColor, gameId]);

  useEffect(() => {
    isMateRef.current = isMate;
  }, [isMate]);

  const applyMove = (from: Square, to: Square, promotion?: string) => {
    const currentPieces = piecesRef.current;
    const currentColorTurn = colorTurnRef.current;
    const currentGameId = gameIdRef.current;
    if (isMateRef.current) return;

    const piece = currentPieces[from];
    if (!piece) return;

    const newPieces = { ...currentPieces };
    const pieceData = typeof piece === "string" ? { type: piece, id: `${piece}-${from}-${currentGameId}` } : piece;
    
    if (pieceData.type.includes("king")) {
      const fromCoord = parseCoordinate(from);
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

    delete newPieces[from];
    newPieces[to] = { ...pieceData, hasMoved: true };

    if (pieceData.type.includes("pawn")) {
       const { row } = parseCoordinate(to);
       if ((pieceData.type.startsWith("w") && row === 1) || (pieceData.type.startsWith("b") && row === 8)) {
          const color = pieceData.type.startsWith("w") ? "w" : "b";
          if (promotion) {
            newPieces[to] = { type: `${color}_${promotion}`, id: `${color}_${promotion}-${to}-${currentGameId}`, hasMoved: true };
          } else {
            setPromotionPending({ from, to, color });
          }
       }
    }

    setPieces(newPieces);
    setActive(null);
    setPossibleMoves([]);
    setColorTurn(currentColorTurn === "w" ? "b" : "w");
  };

  const handleMove = (to: Square) => {
    if (!active) return;
    applyMove(active, to);
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
    engineThinkingRef.current = false;
    engineRequestGameIdRef.current = null;
    engineRef.current?.postMessage?.("ucinewgame");
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

  useEffect(() => {
    let mounted = true;

    const initEngine = () => {
      if (typeof window === "undefined") return;
      if (!mounted) return;
      const engine = new Worker("/stockfish/stockfish.js");
      engineRef.current = engine;

      const handleMessage = (event: MessageEvent) => {
        const line = typeof event.data === "string" ? event.data : "";
        if (!line) return;
        if (line.startsWith("info")) {
          return;
        }
        if (line.startsWith("uciok") || line.startsWith("readyok")) {
          engineReadyRef.current = true;
        }
        if (line.startsWith("bestmove")) {
          engineThinkingRef.current = false;
          if (engineRequestGameIdRef.current !== gameIdRef.current) return;
          const parts = line.split(" ");
          const move = parts[1];
          if (!move || move === "(none)") return;

          const from = uciToSquare(move.slice(0, 2));
          const to = uciToSquare(move.slice(2, 4));
          const promo = move.length > 4 ? move[4] : "";
          const promoMap: Record<string, string> = {
            q: "queen",
            r: "rook",
            b: "bishop",
            n: "knight",
          };
          const promoType = promoMap[promo] || undefined;
          applyMove(from, to, promoType);
        }
      };

      engine.onmessage = handleMessage;
      engine.postMessage("uci");
      engine.postMessage("isready");
      engine.postMessage("ucinewgame");
    };

    initEngine();

    return () => {
      mounted = false;
      if (pendingTimeoutRef.current) clearTimeout(pendingTimeoutRef.current);
      engineRef.current?.terminate?.();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    const engineColor = playerPieceColor === "w" ? "b" : "w";
    if (!aiEnabled) return;
    if (promotionPending || isMate) return;
    if (colorTurn !== engineColor) return;
    if (!engineReadyRef.current) return;
    if (engineThinkingRef.current) return;
    if (!engineRef.current) return;

    engineRef.current.postMessage("isready");
    if (pendingTimeoutRef.current) clearTimeout(pendingTimeoutRef.current);
    pendingTimeoutRef.current = setTimeout(() => {
      if (!engineRef.current) return;
      engineThinkingRef.current = true;
      engineRequestGameIdRef.current = gameIdRef.current;
      const fen = piecesToFen(pieces, colorTurn);
      engineRef.current.postMessage("ucinewgame");
      engineRef.current.postMessage(`position fen ${fen}`);
      engineRef.current.postMessage(`go depth ${engineDepth}`);
    }, 900);

    return () => {
      if (pendingTimeoutRef.current) clearTimeout(pendingTimeoutRef.current);
    };
  }, [
    colorTurn,
    pieces,
    playerPieceColor,
    isMate,
    promotionPending,
    engineDepth,
    aiEnabled,
  ]);

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
