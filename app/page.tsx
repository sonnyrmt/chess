"use client";

import dynamic from "next/dynamic";

const Board = dynamic(() => import("./core/board/board"), { ssr: false });

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Board />
    </div>
  );
}
