"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const Board = dynamic(() => import("./core/board/board"), { ssr: false });

export default function Home() {
  const [playerColor, setPlayerColor] = useState<"w" | "b">("w");
  const [engineDepth, setEngineDepth] = useState(10);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="absolute top-6 right-6 z-40 bg-slate-900/90 text-slate-100 rounded-xl border border-slate-700 shadow-xl px-4 py-3 backdrop-blur">
        <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
          AI
        </div>
        <div className="flex gap-2 mb-3">
          {[6, 10, 14].map((depth) => (
            <button
              key={depth}
              onClick={() => setEngineDepth(depth)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                engineDepth === depth
                  ? "bg-emerald-500 text-slate-900"
                  : "bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
            >
              {depth === 6 ? "Easy" : depth === 10 ? "Normal" : "Hard"}
            </button>
          ))}
        </div>
        <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
          Play As
        </div>
        <div className="flex gap-2">
          {["w", "b"].map((color) => (
            <button
              key={color}
              onClick={() => setPlayerColor(color as "w" | "b")}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                playerColor === color
                  ? "bg-slate-100 text-slate-900"
                  : "bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
            >
              {color === "w" ? "White" : "Black"}
            </button>
          ))}
        </div>
      </div>

      <Board key={playerColor} playerPieceColor={playerColor} engineDepth={engineDepth} />
    </div>
  );
}
