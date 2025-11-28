export type TileType = "straight" | "corner" | "tee" | "cross";

export type MatrixSymbol = "x" | "0" | "1" | "-1" | "^" | "v";

export type Matrix3x3 = [
  [MatrixSymbol, MatrixSymbol, MatrixSymbol],
  [MatrixSymbol, MatrixSymbol, MatrixSymbol],
  [MatrixSymbol, MatrixSymbol, MatrixSymbol],
];

export const SHAPE_SIZE = 3;

