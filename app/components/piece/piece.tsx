import { Dispatch, SetStateAction } from "react";
import { ChessBoardState, Square, PieceData } from "@/app/core/board/types";
import { handlePieceMovement } from "./rules";
import { motion } from "framer-motion";
import { PIECE_SIZES } from "@/app/core/board/constants";

export default function Piece({
  active,
  setActive,
  pieces,
  coordinate,
  setPieces,
  colorTurn,
  setColorTurn,
  playerPieceColor,
  setPossibleMoves,
  handleMove,
  possibleMoves,
}: {
  active: Square | null;
  setActive: Dispatch<SetStateAction<Square | null>>;
  pieces: ChessBoardState;
  coordinate: Square;
  setPieces: Dispatch<SetStateAction<ChessBoardState>>;
  colorTurn: "w" | "b";
  setColorTurn: Dispatch<SetStateAction<"w" | "b">>;
  playerPieceColor: "w" | "b";
  setPossibleMoves: Dispatch<SetStateAction<Square[]>>;
  handleMove: (to: Square) => void;
  possibleMoves: Square[];
}) {
  const handlePieceClick = () => {
    if (active && active === coordinate) {
      setActive(null);
      setPossibleMoves([]);
      return;
    }

    setActive(coordinate);
    const clickedPieceData = pieces[coordinate];

    if (!clickedPieceData) {
      setPossibleMoves([]);
      return;
    }

    const clickedPieceType =
      typeof clickedPieceData === "string"
        ? clickedPieceData
        : clickedPieceData.type;

    const isPieceTurn = clickedPieceType.startsWith(colorTurn);
    if (!isPieceTurn) {
      setPossibleMoves([]);
      return;
    }

    const moves = handlePieceMovement(
      clickedPieceData,
      coordinate,
      pieces,
      colorTurn,
      playerPieceColor,
    );

    if (moves) {
      setPossibleMoves(moves as Square[]);
    } else {
      setPossibleMoves([]);
    }
  };

  const pieceData = pieces[coordinate];
  const pieceTypeFull =
    typeof pieceData === "string" ? pieceData : pieceData?.type;
  const pieceType = pieceTypeFull?.split("_")[1] || "";
  const pieceId = typeof pieceData === "string" ? null : pieceData?.id;
  const size = PIECE_SIZES[pieceType] || { width: 64, height: 64 };

  const getSeededRandom = (seed: string) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const x = Math.sin(hash) * 10000;
    return x - Math.floor(x);
  };

  const seed = pieceId || coordinate;
  const randomX = (getSeededRandom(seed + "x") - 0.5) * 400;
  const randomY = (getSeededRandom(seed + "y") - 0.5) * 400;
  const randomRotate = (getSeededRandom(seed + "r") - 0.5) * 360;
  const delay = getSeededRandom(seed + "d") * 0.5;

  const hasMoved = typeof pieceData === "string" ? false : pieceData?.hasMoved;

  return (
    <motion.button
      layoutId={pieceId || undefined}
      className="cursor-pointer z-10 flex items-center justify-center pointer-events-auto"
      onClick={handlePieceClick}
      drag
      dragSnapToOrigin
      dragElastic={0.1}
      onDragStart={handlePieceClick}
      onDragEnd={(event, info) => {
        const elements = document.elementsFromPoint(info.point.x, info.point.y);
        const targetSquare = elements
          .find((el) => el.hasAttribute("data-coordinate"))
          ?.getAttribute("data-coordinate") as Square | null;

        if (targetSquare && possibleMoves.includes(targetSquare)) {
          handleMove(targetSquare);
        }
      }}
      initial={
        hasMoved
          ? false
          : {
              x: randomX,
              y: randomY,
              rotate: randomRotate,
              opacity: 0,
              scale: 0.5,
            }
      }
      animate={{
        x: 0,
        y: 0,
        rotate: 0,
        opacity: 1,
        scale: 1,
      }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.8,
        delay: hasMoved ? 0 : delay,
      }}
      whileHover={{ scale: 1.1, zIndex: 50 }}
      whileTap={{ scale: 0.95, cursor: "grabbing" }}
      style={{ width: size.width, height: size.height }}
    >
      <img
        className="pointer-events-none drop-shadow-xl object-contain max-w-none"
        src={`/pieces/${pieceTypeFull}.png`}
        alt={pieceTypeFull}
        style={{ width: size.width, height: size.height }}
      />
    </motion.button>
  );
}
