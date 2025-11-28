import { useMemo, useState } from "react";
import PageWrapper from "@/components/PageWrapper";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, RotateCw, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { createShape } from "@/puzzle/matrix/createShape";
import { MatrixShape } from "@/puzzle/matrix/MatrixShape";
import { SHAPE_SIZE, TileType, MatrixSymbol, Matrix3x3 } from "@/puzzle/matrix/types";
import {
  Connector,
  Direction,
  Flow,
  DIRECTIONS,
  OFFSETS,
  OPPOSITE,
  directionLabel,
  invertFlow,
  rotateDirection,
} from "@/puzzle/matrix/directions";

interface TileState {
  id: string;
  row: number;
  col: number;
  shape: MatrixShape;
  isStart?: boolean;
  isEnd?: boolean;
  ports?: Connector[];
}

interface EvaluationResult {
  errors: string[];
  solved: boolean;
  path?: string[];
}

const GRID_SIZE = 3;

const createTileId = (row: number, col: number) => `${String.fromCharCode(65 + row)}${col + 1}`;

const BOARD_BLUEPRINT: Array<{
  row: number;
  col: number;
  type: TileType;
  rotation: number;
  flipped: boolean;
  isStart?: boolean;
  isEnd?: boolean;
  ports?: Connector[];
}> = [
    { row: 0, col: 0, type: "straight", rotation: 0, flipped: false, isStart: true, ports: [{ side: "left", flow: "in" }] },
    { row: 0, col: 1, type: "straight", rotation: 0, flipped: false },
    { row: 0, col: 2, type: "corner", rotation: 1, flipped: false },
    { row: 1, col: 0, type: "corner", rotation: 2, flipped: true },
    { row: 1, col: 1, type: "straight", rotation: 2, flipped: false },
    { row: 1, col: 2, type: "corner", rotation: 0, flipped: false },
    { row: 2, col: 0, type: "corner", rotation: 3, flipped: true },
    { row: 2, col: 1, type: "straight", rotation: 0, flipped: false },
    { row: 2, col: 2, type: "straight", rotation: 0, flipped: false, isEnd: true, ports: [{ side: "right", flow: "out" }] },
  ];

const buildBoard = () =>
  BOARD_BLUEPRINT.map((config) => ({
    id: createTileId(config.row, config.col),
    row: config.row,
    col: config.col,
    isStart: config.isStart,
    isEnd: config.isEnd,
    ports: config.ports,
    shape: createShape(config.type, config.rotation, config.flipped),
  }));

const scrambleTiles = () =>
  buildBoard().map((tile) => {
    const rotationShift = Math.floor(Math.random() * 4);
    const shouldFlip = Math.random() > 0.5;
    const rotated = tile.shape.rotateBy(rotationShift);
    const finalShape = shouldFlip ? rotated.toggleFlip() : rotated;
    return { ...tile, shape: finalShape };
  });

type DirectionCounts = Record<Direction, { in: number; out: number }>;

const createEmptyCounts = (): DirectionCounts => ({
  up: { in: 0, out: 0 },
  right: { in: 0, out: 0 },
  down: { in: 0, out: 0 },
  left: { in: 0, out: 0 },
});

const cloneCounts = (counts: DirectionCounts): DirectionCounts => ({
  up: { ...counts.up },
  right: { ...counts.right },
  down: { ...counts.down },
  left: { ...counts.left },
});

const summarizeConnectors = (connectors: Connector[]): DirectionCounts => {
  const summary = createEmptyCounts();
  connectors.forEach(({ side, flow }) => {
    summary[side][flow] += 1;
  });
  return summary;
};

const transformPorts = (tile: TileState): Connector[] =>
  tile.ports ?? [];

const evaluateBoard = (tiles: TileState[]): EvaluationResult => {
  const errors: string[] = [];
  const connectors = tiles.map((tile) => tile.shape.getConnectors());
  const ports = tiles.map(transformPorts);
  const counts = connectors.map(summarizeConnectors);
  const availableIn = counts.map(cloneCounts);
  const externalOut = ports.map(() => createEmptyCounts());

  const startIndex = tiles.findIndex((tile) => tile.isStart);
  const endIndex = tiles.findIndex((tile) => tile.isEnd);
  if (startIndex === -1 || endIndex === -1) {
    return { errors: ["Puzzle is missing a start or end tile."], solved: false };
  }

  ports.forEach((portList, idx) => {
    portList.forEach((port) => {
      if (port.flow === "in") {
        availableIn[idx][port.side].in -= 1;
        if (availableIn[idx][port.side].in < 0) {
          errors.push(`Tile ${tiles[idx].id} has an external source on the ${directionLabel(port.side)} edge but no inward arrow.`);
        }
      } else {
        externalOut[idx][port.side].out += 1;
        if (counts[idx][port.side].out < externalOut[idx][port.side].out) {
          errors.push(`Tile ${tiles[idx].id} has an external sink on the ${directionLabel(port.side)} edge but no outward arrow to feed it.`);
        }
      }
    });
  });

  const outDegrees = Array(tiles.length).fill(0);
  const inDegrees = Array(tiles.length).fill(0);
  const adjacency = new Map<number, number>();
  const nodesInPlay = new Set<number>();

  tiles.forEach((tile, idx) => {
    DIRECTIONS.forEach((dir) => {
      const totalOut = counts[idx][dir].out;
      const reservedForExternal = externalOut[idx][dir].out;
      const usableOut = totalOut - reservedForExternal;
      if (usableOut < 0) {
        errors.push(`Tile ${tile.id} misconfigured on ${directionLabel(dir)} edge.`);
        return;
      }
      for (let i = 0; i < usableOut; i++) {
        const neighborRow = tile.row + OFFSETS[dir].row;
        const neighborCol = tile.col + OFFSETS[dir].col;
        if (neighborRow < 0 || neighborRow >= GRID_SIZE || neighborCol < 0 || neighborCol >= GRID_SIZE) {
          errors.push(`Tile ${tile.id} points ${directionLabel(dir)} into empty space.`);
          continue;
        }
        const neighborIndex = neighborRow * GRID_SIZE + neighborCol;
        const opposite = OPPOSITE[dir];
        if (availableIn[neighborIndex][opposite].in <= 0) {
          errors.push(`Flow from ${tile.id} toward ${tiles[neighborIndex].id} collides or is blocked (${directionLabel(dir)} side).`);
          continue;
        }
        availableIn[neighborIndex][opposite].in -= 1;
        outDegrees[idx] += 1;
        inDegrees[neighborIndex] += 1;
        nodesInPlay.add(idx);
        nodesInPlay.add(neighborIndex);
        if (adjacency.has(idx) && adjacency.get(idx) !== neighborIndex) {
          errors.push(`Tile ${tile.id} splits the flow between multiple neighbors.`);
        } else {
          adjacency.set(idx, neighborIndex);
        }
      }
    });
  });

  if (errors.length > 0) {
    return { errors, solved: false };
  }

  availableIn.forEach((dirCounts, idx) => {
    DIRECTIONS.forEach((dir) => {
      if (dirCounts[dir].in > 0) {
        errors.push(`Tile ${tiles[idx].id} expects incoming flow from the ${directionLabel(dir)} but nothing feeds it.`);
      }
    });
  });

  if (errors.length > 0) {
    return { errors, solved: false };
  }

  const requireExternal = (index: number, flow: Flow) =>
    ports[index]?.some((port) => port.flow === flow) ?? false;

  tiles.forEach((tile, idx) => {
    const incoming = inDegrees[idx];
    const outgoing = outDegrees[idx];
    if (tile.isStart) {
      if (!requireExternal(idx, "in")) {
        errors.push("Start tile is missing a source port.");
      }
      if (incoming !== 0) {
        errors.push("Start tile cannot receive flow from another tile.");
      }
      if (outgoing !== 1) {
        errors.push("Start tile must send flow to exactly one neighbor.");
      }
    } else if (tile.isEnd) {
      if (!requireExternal(idx, "out")) {
        errors.push("End tile is missing a sink port.");
      }
      if (incoming !== 1) {
        errors.push("End tile must receive flow from exactly one neighbor.");
      }
      if (outgoing !== 0) {
        errors.push("End tile cannot send flow onward.");
      }
    } else {
      if (incoming !== outgoing) {
        errors.push(`Tile ${tile.id} has unequal inbound (${incoming}) and outbound (${outgoing}) flow.`);
      }
      if (incoming > 1 || outgoing > 1) {
        errors.push(`Tile ${tile.id} branches the path, which is not allowed.`);
      }
      if (incoming === 0 && outgoing === 0) {
        errors.push(`Tile ${tile.id} is disconnected from the path.`);
      }
    }
  });

  if (errors.length > 0) {
    return { errors, solved: false };
  }

  const pathOrder: number[] = [];
  const visited = new Set<number>();
  let current = startIndex;

  while (true) {
    pathOrder.push(current);
    if (visited.has(current)) {
      errors.push("Detected a loop in the flow.");
      break;
    }
    visited.add(current);
    const next = adjacency.get(current);
    if (next === undefined) {
      break;
    }
    current = next;
  }

  if (errors.length > 0) {
    return { errors, solved: false };
  }

  if (current !== endIndex) {
    errors.push("The directed flow does not terminate at the designated end tile.");
  }
  if (visited.size !== nodesInPlay.size) {
    errors.push("Some tiles with roads are not part of the main path.");
  }
  if (pathOrder.length !== nodesInPlay.size) {
    errors.push("The path skips one or more tiles.");
  }

  if (errors.length > 0) {
    return { errors, solved: false };
  }

  return {
    errors: [],
    solved: true,
    path: pathOrder.map((index) => tiles[index].id),
  };
};

interface FlowTileProps {
  tile: TileState;
  matrix: Matrix3x3;
  selected: boolean;
  onSelect: () => void;
}

const symbolGlyph: Record<MatrixSymbol, string> = {
  x: "",
  "0": "•",
  "1": "→",
  "-1": "←",
  v: "↓",
  "^": "↑",
};

const matrixValueGlyph: Record<MatrixSymbol, string> = {
  x: "",
  "0": "0",
  "1": "1",
  "-1": "-1",
  v: "1",
  "^": "-1",
};

const FlowTile = ({ tile, matrix, selected, onSelect }: FlowTileProps) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onSelect}
    onKeyDown={(event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelect();
      }
    }}
    className={cn(
      "relative rounded-2xl bg-neutral-200 p-1 transition",
      selected && "ring-2 ring-yellow-400",
    )}
  >
    {(tile.isStart || tile.isEnd) && (
      <span
        className={cn(
          "absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider",
          tile.isStart ? "bg-emerald-500/80 text-white" : "bg-fuchsia-500/80 text-white",
        )}
      >
        {tile.isStart ? "Start" : "End"}
      </span>
    )}
    <div className="grid grid-cols-3 gap-px rounded-xl border border-neutral-400 bg-neutral-400">
      {matrix.map((row, rowIdx) =>
        row.map((symbol, colIdx) => (
          <div
            key={`${tile.id}-${rowIdx}-${colIdx}`}
            className={cn(
              "flex aspect-square items-center justify-center text-base font-semibold",
              symbol === "x" ? "bg-white text-white" : "bg-neutral-600 text-white",
            )}
          >
            {symbolGlyph[symbol]}
          </div>
        )),
      )}
    </div>
  </div>
);

const MatrixPreview = ({ matrix }: { matrix: MatrixSymbol[][] }) => (
  <div className="rounded-3xl border bg-card p-5 shadow-sm">
    <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">9×9 map</div>
    <div className="mt-3 grid grid-cols-9 gap-px overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-800">
      {matrix.flat().map((symbol, idx) => (
        <div
          key={idx}
          className={cn(
            "flex aspect-square items-center justify-center text-[11px] font-semibold text-white",
            symbol === "x" ? "bg-neutral-900/40" : "bg-black",
          )}
        >
          {matrixValueGlyph[symbol]}
        </div>
      ))}
    </div>
  </div>
);

const composeBoardMatrix = (tiles: TileState[]): MatrixSymbol[][] => {
  const size = GRID_SIZE * SHAPE_SIZE;
  const matrix: MatrixSymbol[][] = Array.from({ length: size }, () => Array<MatrixSymbol>(size).fill("x"));
  tiles.forEach((tile) => {
    const tileMatrix = tile.shape.getMatrix();
    for (let r = 0; r < SHAPE_SIZE; r++) {
      for (let c = 0; c < SHAPE_SIZE; c++) {
        matrix[tile.row * SHAPE_SIZE + r][tile.col * SHAPE_SIZE + c] = tileMatrix[r][c];
      }
    }
  });
  return matrix;
};

const FindMin = () => {
  const [tiles, setTiles] = useState<TileState[]>(() => scrambleTiles());
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [validation, setValidation] = useState<EvaluationResult | null>(null);

  const connectors = useMemo(() => tiles.map((tile) => tile.shape.getConnectors()), [tiles]);
  const ports = useMemo(() => tiles.map(transformPorts), [tiles]);
  const matrices = useMemo(() => tiles.map((tile) => tile.shape.getMatrix()), [tiles]);
  const boardMatrix = useMemo(() => composeBoardMatrix(tiles), [tiles]);

  const selectedTile = selectedIndex !== null ? tiles[selectedIndex] : null;

  const rotateTile = (index: number | null) => {
    if (index === null) return;
    setTiles((current) =>
      current.map((tile, idx) => (idx === index ? { ...tile, shape: tile.shape.rotateClockwise() } : tile)),
    );
    setValidation(null);
  };

  const flipTile = (index: number | null) => {
    if (index === null) return;
    setTiles((current) =>
      current.map((tile, idx) => (idx === index ? { ...tile, shape: tile.shape.toggleFlip() } : tile)),
    );
    setValidation(null);
  };

  const checkRoute = () => {
    setValidation(evaluateBoard(tiles));
  };

  return (
    <PageWrapper showHeader={false} showFooter={false}>
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-3 text-center lg:text-left">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Systems thinking</p>
          <h1 className="text-4xl font-semibold tracking-tight">Matrix Flow Puzzle</h1>
          <p className="text-base text-muted-foreground lg:max-w-3xl">
            Each tile is a 3×3 mini-map: dark squares are walls and bright squares contain arrows that indicate the
            current flow direction (→ / ← for horizontal, ↓ / ↑ for vertical). Rotate or flip a tile to reorient its
            arrows, then verify that a single directed path links the start tile to the end tile with no stray roads.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="space-y-6">
            <div className="rounded-3xl border bg-card p-6 shadow-lg">
              <div className="mx-auto max-w-xl">
                <div className="grid grid-cols-3 gap-1 rounded-[32px] border border-neutral-400 bg-neutral-300 p-1">
                  {tiles.map((tile, idx) => (
                    <FlowTile
                      key={tile.id}
                      tile={tile}
                      matrix={matrices[idx]}
                      selected={selectedIndex === idx}
                      onSelect={() => setSelectedIndex(idx)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border bg-muted/30 p-6 shadow-inner space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="gap-2" disabled={selectedTile == null} onClick={() => rotateTile(selectedIndex)}>
                  <RotateCw className="h-4 w-4" />
                  Rotate selected tile
                </Button>
                <Button variant="outline" className="gap-2" disabled={selectedTile == null} onClick={() => flipTile(selectedIndex)}>
                  <ArrowLeftRight className="h-4 w-4" />
                  Flip arrow direction
                </Button>
                <Button className="gap-2" onClick={checkRoute}>
                  <ShieldCheck className="h-4 w-4" />
                  Check route
                </Button>
              </div>
              {selectedTile && (
                <p className="text-sm text-muted-foreground">
                  Selected tile: <strong>{selectedTile.id}</strong> ({selectedTile.shape.type})
                </p>
              )}
              {validation && (
                validation.solved ? (
                  <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">
                    <p className="font-semibold">Flow verified!</p>
                    <p className="mt-1">Path: {validation.path?.join(" → ")}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(validation.errors.length > 0 ? validation.errors : ["Something is still off."]).map((message, idx) => (
                      <div key={idx} className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                        {message}
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>

          <MatrixPreview matrix={boardMatrix} />
        </div>
      </div>
    </PageWrapper>
  );
};
export default FindMin;
