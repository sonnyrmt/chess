import { ChessBoardState } from "./types";

export const cols = [1, 2, 3, 4, 5, 6, 7, 8];
export const rows = [1, 2, 3, 4, 5, 6, 7, 8];

export const initialPositions: ChessBoardState = {
  A1: "w_rook",
  B1: "w_knight",
  C1: "w_bishop",
  D1: "w_queen",
  E1: "w_king",
  F1: "w_bishop",
  G1: "w_knight",
  H1: "w_rook",

  A2: "w_pawn",
  B2: "w_pawn",
  C2: "w_pawn",
  D2: "w_pawn",
  E2: "w_pawn",
  F2: "w_pawn",
  G2: "w_pawn",
  H2: "w_pawn",

  A3: "",
  B3: "",
  C3: "",
  D3: "",
  E3: "",
  F3: "",
  G3: "",
  H3: "",

  A4: "",
  B4: "",
  C4: "",
  D4: "",
  E4: "",
  F4: "",
  G4: "",
  H4: "",

  A5: "",
  B5: "",
  C5: "",
  D5: "",
  E5: "",
  F5: "",
  G5: "",
  H5: "",

  A6: "",
  B6: "",
  C6: "",
  D6: "",
  E6: "",
  F6: "",
  G6: "",
  H6: "",

  A7: "b_pawn",
  B7: "b_pawn",
  C7: "b_pawn",
  D7: "b_pawn",
  E7: "b_pawn",
  F7: "b_pawn",
  G7: "b_pawn",
  H7: "b_pawn",

  A8: "b_rook",
  B8: "b_knight",
  C8: "b_bishop",
  D8: "b_queen",
  E8: "b_king",
  F8: "b_bishop",
  G8: "b_knight",
  H8: "b_rook",
};

export const PIECE_SIZES: Record<string, { width: number; height: number }> = {
  pawn: { width: 40, height: 50 },
  rook: { width: 55, height: 66 },
  knight: { width: 55, height: 66 },
  bishop: { width: 55, height: 66 },
  queen: { width: 55, height: 66 },
  king: { width: 55, height: 66 },
};
