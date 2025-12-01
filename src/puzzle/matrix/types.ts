import { MatrixShape } from "./MatrixShape";
import { Connector } from "./directions";

export type TileType = "straight" | "corner" | "tee" | "cross";

export type MatrixSymbol = "x" | "0" | "1" | "-1" | "^" | "v";

export type Matrix3x3 = [
  [MatrixSymbol, MatrixSymbol, MatrixSymbol],
  [MatrixSymbol, MatrixSymbol, MatrixSymbol],
  [MatrixSymbol, MatrixSymbol, MatrixSymbol],
];

export const SHAPE_SIZE = 3;

export interface TileState {
  id: string;
  row: number;
  col: number;
  shape: MatrixShape;
  isStart?: boolean;
  isEnd?: boolean;
  ports?: Connector[];
}

export interface EvaluationResult {
  errors: string[];
  solved: boolean;
  path?: string[];
}

