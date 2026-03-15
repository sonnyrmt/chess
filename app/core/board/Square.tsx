import { getBackgroundColor } from "./utils";
import { ChessBoardState, Square as SquareShift } from "./types";
import Piece from "@/app/components/piece/piece";
import { Dispatch, SetStateAction } from "react";
import { AnimatePresence } from "framer-motion";

interface SquareProps {
  row: number;
  col: number;
  coordinate: SquareShift;
  isActive: boolean;
  isPossibleMove: boolean;
  pieces: ChessBoardState;
  active: SquareShift | null;
  setActive: Dispatch<SetStateAction<SquareShift | null>>;
  setPieces: Dispatch<SetStateAction<ChessBoardState>>;
  colorTurn: "w" | "b";
  setColorTurn: Dispatch<SetStateAction<"w" | "b">>;
  playerPieceColor: "w" | "b";
  setPossibleMoves: Dispatch<SetStateAction<SquareShift[]>>;
  handleMove: (to: SquareShift) => void;
  possibleMoves: SquareShift[];
  isCheck: boolean;
}

export default function Square({
  row,
  col,
  coordinate,
  isActive,
  isPossibleMove,
  pieces,
  active,
  setActive,
  setPieces,
  colorTurn,
  setColorTurn,
  playerPieceColor,
  setPossibleMoves,
  handleMove,
  possibleMoves,
  isCheck,
}: SquareProps) {
  const background = getBackgroundColor(row, col, isActive);
  const hasPiece = !!pieces[coordinate];

  return (
    <div
      data-coordinate={coordinate}
      className={`h-20 w-20 flex justify-center items-center relative ${background}`}
      onClick={() => isPossibleMove && handleMove(coordinate)}
    >
      <div className="w-full h-full flex justify-center items-center overflow-visible">
        <AnimatePresence initial={true}>
          {hasPiece && (
            <Piece
              key={coordinate}
              active={active}
              setActive={setActive}
              pieces={pieces}
              coordinate={coordinate}
              setPieces={setPieces}
              colorTurn={colorTurn}
              setColorTurn={setColorTurn}
              playerPieceColor={playerPieceColor}
              setPossibleMoves={setPossibleMoves}
              handleMove={handleMove}
              possibleMoves={possibleMoves}
            />
          )}
        </AnimatePresence>
      </div>
      {isPossibleMove && (
        <div
          className={`absolute rounded-full pointer-events-none ${
            hasPiece
              ? "w-16 h-16 border-4 border-red-500/60"
              : "w-6 h-6 bg-black/20"
          }`}
        />
      )}
    </div>
  );
}
