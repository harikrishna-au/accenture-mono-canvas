import { TileState, EvaluationResult } from "./types";
import { Flow, Connector, DIRECTIONS, OFFSETS, OPPOSITE, directionLabel } from "./directions";

export const GRID_SIZE = 3;

const transformPorts = (tile: TileState): Connector[] => {
    return tile.ports || [];
};

const createEmptyCounts = () => ({
    up: { in: 0, out: 0 },
    down: { in: 0, out: 0 },
    left: { in: 0, out: 0 },
    right: { in: 0, out: 0 },
});

const summarizeConnectors = (connectors: Connector[]) => {
    const counts = createEmptyCounts();
    connectors.forEach((c) => {
        if (c.flow === "in") counts[c.side].in++;
        else counts[c.side].out++;
    });
    return counts;
};

const cloneCounts = (counts: ReturnType<typeof createEmptyCounts>) =>
    JSON.parse(JSON.stringify(counts)) as ReturnType<typeof createEmptyCounts>;

export const evaluateBoard = (tiles: TileState[]): EvaluationResult => {
    const errors: string[] = [];
    const startIndex = tiles.findIndex((tile) => tile.isStart);
    const endIndex = tiles.findIndex((tile) => tile.isEnd);

    if (startIndex === -1 || endIndex === -1) {
        return { errors: ["Puzzle is missing a start or end tile."], solved: false };
    }

    // Map of Tile Index -> List of Connectors
    const connectorsMap = tiles.map((tile) => tile.shape.getConnectors());

    // 0. Check Start/End Alignment with External Ports
    const startTile = tiles[startIndex];
    const startConnectors = connectorsMap[startIndex];
    if (startTile.ports) {
        for (const port of startTile.ports) {
            const match = startConnectors.find(c => c.side === port.side && c.flow === port.flow);
            if (!match) {
                errors.push(`Start tile is not aligned with the external entry (${directionLabel(port.side)}).`);
            }
        }
    }

    const endTile = tiles[endIndex];
    const endConnectors = connectorsMap[endIndex];
    if (endTile.ports) {
        for (const port of endTile.ports) {
            const match = endConnectors.find(c => c.side === port.side && c.flow === port.flow);
            if (!match) {
                errors.push(`End tile is not aligned with the external exit (${directionLabel(port.side)}).`);
            }
        }
    }

    if (errors.length > 0) {
        return { errors, solved: false };
    }

    // BFS State
    const queue: number[] = [startIndex];
    const visited = new Set<number>();
    visited.add(startIndex);

    let endReached = false;

    while (queue.length > 0) {
        const currentIndex = queue.shift()!;
        if (currentIndex === endIndex) {
            endReached = true;
            continue;
        }

        const currentTile = tiles[currentIndex];
        const currentConnectors = connectorsMap[currentIndex];

        // 1. Check if this is a Dead End (non-End tile with no outputs)
        // Note: We only care about active outputs.
        const outputs = currentConnectors.filter(c => c.flow === "out");

        if (outputs.length === 0) {
            errors.push(`Path ends abruptly at Tile ${currentTile.id}.`);
        }

        // 2. Traverse Outputs
        for (const output of outputs) {
            const dir = output.side;
            const neighborRow = currentTile.row + OFFSETS[dir].row;
            const neighborCol = currentTile.col + OFFSETS[dir].col;

            // Check Boundary
            if (neighborRow < 0 || neighborRow >= GRID_SIZE || neighborCol < 0 || neighborCol >= GRID_SIZE) {
                errors.push(`Tile ${currentTile.id} points ${directionLabel(dir)} into empty space.`);
                continue;
            }

            const neighborIndex = neighborRow * GRID_SIZE + neighborCol;
            const neighborTile = tiles[neighborIndex];
            const neighborConnectors = connectorsMap[neighborIndex];
            const oppositeDir = OPPOSITE[dir];

            // Check if Neighbor Accepts Flow (Has Input on Opposite Side)
            const hasInput = neighborConnectors.some(c => c.side === oppositeDir && c.flow === "in");

            if (!hasInput) {
                errors.push(`Flow from ${currentTile.id} toward ${neighborTile.id} is blocked (${directionLabel(dir)} side).`);
            } else {
                // Valid Connection
                if (!visited.has(neighborIndex)) {
                    visited.add(neighborIndex);
                    queue.push(neighborIndex);
                }
            }
        }

    }

    // 3. Final Checks
    if (errors.length > 0) {
        return { errors, solved: false };
    }

    if (!endReached) {
        return { errors: ["The path does not reach the End tile."], solved: false };
    }

    return {
        errors: [],
        solved: true,
        path: Array.from(visited).map(i => tiles[i].id)
    };
};
