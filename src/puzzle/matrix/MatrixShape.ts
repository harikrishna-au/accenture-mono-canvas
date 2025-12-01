import { Connector, invertFlow, rotateDirection, Direction } from "./directions";
import { Matrix3x3, MatrixSymbol, TileType } from "./types";
import { createEmptyMatrix } from "./utils";

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

const rotateSymbol = (symbol: MatrixSymbol, steps: number): MatrixSymbol => {
  const normalized = ((steps % 4) + 4) % 4;
  if (normalized === 0) return symbol;
  let current = symbol;
  for (let i = 0; i < normalized; i++) {
    current = rotateSymbolOnce(current);
  }
  return current;
};

const rotateSymbolOnce = (symbol: MatrixSymbol): MatrixSymbol => {
  switch (symbol) {
    case "1":
      return "v";
    case "v":
      return "-1";
    case "-1":
      return "^";
    case "^":
      return "1";
    default:
      return symbol;
  }
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

export abstract class MatrixShape {
  constructor(
    public rotation = 0,
    public flipped = false,
    public disabledPorts: Direction[] = []
  ) { }

  abstract readonly type: TileType;
  abstract readonly isHub: boolean;
  protected abstract baseConnectors: Connector[];

  protected abstract spawn(rotation: number, flipped: boolean, disabledPorts: Direction[]): MatrixShape;

  cycleConfiguration(): MatrixShape {
    return this;
  }

  rotateClockwise(): MatrixShape {
    return this.spawn((this.rotation + 1) % 4, this.flipped, this.disabledPorts);
  }

  rotateBy(steps: number): MatrixShape {
    const normalized = ((this.rotation + steps) % 4 + 4) % 4;
    return this.spawn(normalized, this.flipped, this.disabledPorts);
  }

  toggleFlip(): MatrixShape {
    return this.spawn(this.rotation, !this.flipped, this.disabledPorts);
  }

  setFlip(flipped: boolean): MatrixShape {
    return this.spawn(this.rotation, flipped, this.disabledPorts);
  }

  getMatrix(): Matrix3x3 {
    const matrix = createEmptyMatrix();

    const connectors = this.getConnectors();

    // Fill edges based on connectors
    connectors.forEach(({ side, flow }) => {
      let symbol: MatrixSymbol = "x";
      if (side === "up") symbol = flow === "in" ? "v" : "^";
      if (side === "down") symbol = flow === "in" ? "^" : "v";
      if (side === "left") symbol = flow === "in" ? "1" : "-1";
      if (side === "right") symbol = flow === "in" ? "-1" : "1";

      if (side === "up") matrix[0][1] = symbol;
      if (side === "down") matrix[2][1] = symbol;
      if (side === "left") matrix[1][0] = symbol;
      if (side === "right") matrix[1][2] = symbol;
    });

    // Render disabled ports as empty roads ("0")
    this.disabledPorts.forEach((baseSide) => {
      // Rotate base side to visual side
      const visualSide = rotateDirection(baseSide, this.rotation);
      if (visualSide === "up") matrix[0][1] = "0";
      if (visualSide === "down") matrix[2][1] = "0";
      if (visualSide === "left") matrix[1][0] = "0";
      if (visualSide === "right") matrix[1][2] = "0";
    });

    // Fill center
    if (this.isHub) {
      matrix[1][1] = "0";
    } else {
      // For paths (Straight/Corner/Tee), center follows the OUT flow
      // If no OUT flow (shouldn't happen in valid tiles but safe fallback), use "0"
      const outConnector = connectors.find(c => c.flow === "out");
      if (outConnector) {
        const side = outConnector.side;
        if (side === "up") matrix[1][1] = "^";
        else if (side === "down") matrix[1][1] = "v";
        else if (side === "left") matrix[1][1] = "-1";
        else if (side === "right") matrix[1][1] = "1";
      } else {
        // Fallback for Start tile which might only have IN if misconfigured, 
        // or End tile which only has IN.
        // Actually Start has OUT, End has IN.
        // If only IN (End tile), center should point IN direction (follow the flow)
        const inConnector = connectors.find(c => c.flow === "in");
        if (inConnector) {
          const side = inConnector.side;
          // If flow is IN from UP (v), center continues down (v)
          if (side === "up") matrix[1][1] = "v";
          else if (side === "down") matrix[1][1] = "^";
          else if (side === "left") matrix[1][1] = "1";
          else if (side === "right") matrix[1][1] = "-1";
        } else {
          matrix[1][1] = "0";
        }
      }
    }

    return matrix;
  }

  getConnectors(): Connector[] {
    return this.baseConnectors
      .filter(c => !this.disabledPorts.includes(c.side))
      .map(({ side, flow }) => ({
        side: rotateDirection(side, this.rotation),
        flow: this.flipped ? invertFlow(flow) : flow,
      }));
  }

  clone(): MatrixShape {
    return this.spawn(this.rotation, this.flipped, this.disabledPorts);
  }
}

