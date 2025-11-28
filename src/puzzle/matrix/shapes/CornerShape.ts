import { Connector } from "../directions";
import { Matrix3x3, MatrixSymbol } from "../types";
import { MatrixShape } from "../MatrixShape";

const rotateMatrix = (matrix: Matrix3x3, steps: number): Matrix3x3 => {
  if (steps % 4 === 0) {
    return matrix.map((row) => [...row]) as Matrix3x3;
  }
  let result = matrix.map((row) => [...row]) as Matrix3x3;
  const turns = ((steps % 4) + 4) % 4;
  for (let turn = 0; turn < turns; turn++) {
    const next: Matrix3x3 = [
      [result[2][0], result[1][0], result[0][0]],
      [result[2][1], result[1][1], result[0][1]],
      [result[2][2], result[1][2], result[0][2]],
    ];
    result = next;
  }
  return result;
};

const flipSymbol = (symbol: MatrixSymbol): MatrixSymbol => {
  switch (symbol) {
    case "1":
      return "-1";
    case "-1":
      return "1";
    case "v":
      return "^";
    case "^":
      return "v";
    default:
      return symbol;
  }
};

export class CornerShape extends MatrixShape {
  readonly type = "corner";

  readonly isHub = false;

  protected baseConnectors: Connector[] = [
    { side: "up", flow: "in" },
    { side: "right", flow: "out" },
  ];

  protected spawn(rotation: number, flipped: boolean): MatrixShape {
    return new CornerShape(rotation, flipped);
  }
}

