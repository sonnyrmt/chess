"use client";

import { useState } from "react";
import { cols, rows } from "./constants";
import { getCoordinate } from "./utils";
import { useChessGame } from "./hooks/useChessGame";
import Square from "./Square";

export default function Board() {
  const [playerPieceColor] = useState<"w" | "b">("w");
  const game = useChessGame(playerPieceColor);

  const colLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const displayRows = [...rows].reverse();

  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-screen relative">
      <div className="relative p-8 bg-slate-800 shadow-2xl border-4 border-slate-700">
        <div className="absolute top-0 left-8 right-8 h-8 flex items-center justify-around text-slate-300 font-bold">
          {colLabels.map((l) => (
            <span key={`top-${l}`} className="w-20 text-center">
              {l}
            </span>
          ))}
        </div>

        <div className="absolute bottom-0 left-8 right-8 h-8 flex items-center justify-around text-slate-300 font-bold">
          {colLabels.map((l) => (
            <span key={`bottom-${l}`} className="w-20 text-center">
              {l}
            </span>
          ))}
        </div>

        <div className="absolute left-0 top-8 bottom-8 w-8 flex flex-col items-center justify-around text-slate-300 font-bold">
          {displayRows.map((r) => (
            <span key={`left-${r}`} className="h-20 flex items-center">
              {r}
            </span>
          ))}
        </div>

        <div className="absolute right-0 top-8 bottom-8 w-8 flex flex-col items-center justify-around text-slate-300 font-bold">
          {displayRows.map((r) => (
            <span key={`right-${r}`} className="h-20 flex items-center">
              {r}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-8 overflow-hidden border-4 border-slate-900 shadow-inner">
          {cols.map((col: number) => {
            return (
              <div key={`col-${col}`}>
                {rows.map((row: number) => {
                  const { coordinate } = getCoordinate(row, col);
                  const isActive = game.active === coordinate;
                  const isPossibleMove = game.possibleMoves.includes(
                    coordinate as any,
                  );

                  return (
                    <Square
                      key={`${coordinate}`}
                      row={row}
                      col={col}
                      coordinate={coordinate as any}
                      isActive={isActive}
                      isPossibleMove={isPossibleMove}
                      pieces={game.pieces}
                      active={game.active}
                      setActive={game.setActive}
                      setPieces={game.setPieces}
                      colorTurn={game.colorTurn}
                      setColorTurn={game.setColorTurn}
                      playerPieceColor={game.playerPieceColor}
                      setPossibleMoves={game.setPossibleMoves}
                      handleMove={game.handleMove}
                      possibleMoves={game.possibleMoves}
                      isCheck={game.isCheck}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      {game.promotionPending && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 rounded-lg">
          <div className="bg-white p-6 rounded-xl shadow-2xl flex gap-6 border-4 border-slate-700">
            {["queen", "rook", "bishop", "knight"].map((piece) => (
              <button
                key={piece}
                onClick={() => game.promotePawn(piece)}
                className="hover:bg-slate-100 p-3 rounded-lg transition-all transform hover:scale-110 active:scale-95 flex flex-col items-center gap-2"
              >
                <img
                  src={`/pieces/${game.promotionPending?.color}_${piece}.png`}
                  alt={piece}
                  className="w-16 h-16 drop-shadow-md"
                />
                <span className="text-slate-800 font-bold capitalize text-sm">
                  {piece}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
