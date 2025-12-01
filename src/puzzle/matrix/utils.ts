import { Matrix3x3, TileType } from "./types";
import { Connector, Direction, OFFSETS, OPPOSITE, rotateDirection } from "./directions";

export const createEmptyMatrix = (): Matrix3x3 => [
    ["x", "x", "x"],
    ["x", "x", "x"],
    ["x", "x", "x"],
];

export interface BoardConfig {
    row: number;
    col: number;
    type: TileType;
    rotation: number;
    flipped: boolean;
    isStart?: boolean;
    isEnd?: boolean;
    ports?: Connector[];
}

export const INITIAL_BOARD_CONFIG: BoardConfig[] = [
    { row: 0, col: 0, type: "straight", rotation: 0, flipped: false, isStart: true, ports: [{ side: "left", flow: "in" }] },
    { row: 0, col: 1, type: "straight", rotation: 0, flipped: false },
    { row: 0, col: 2, type: "corner", rotation: 1, flipped: false },
    { row: 1, col: 0, type: "corner", rotation: 2, flipped: true },
    { row: 1, col: 1, type: "cross", rotation: 2, flipped: false },
    { row: 1, col: 2, type: "tee", rotation: 0, flipped: false },
    { row: 2, col: 0, type: "corner", rotation: 3, flipped: true },
    { row: 2, col: 1, type: "straight", rotation: 0, flipped: false },
    { row: 2, col: 2, type: "straight", rotation: 0, flipped: false, isEnd: true, ports: [{ side: "right", flow: "out" }] },
];

// --- Level Generator ---

// --- Static Levels (Scrambled) ---

const LEVEL_1: BoardConfig[] = [
    { row: 0, col: 0, type: "corner", rotation: 1, flipped: false, isStart: true, ports: [{ side: "left", flow: "in" }] },
    { row: 0, col: 1, type: "straight", rotation: 1, flipped: false },
    { row: 0, col: 2, type: "corner", rotation: 2, flipped: false },
    { row: 1, col: 0, type: "straight", rotation: 0, flipped: false },
    { row: 1, col: 1, type: "corner", rotation: 0, flipped: false },
    { row: 1, col: 2, type: "straight", rotation: 0, flipped: false },
    { row: 2, col: 0, type: "corner", rotation: 0, flipped: false },
    { row: 2, col: 1, type: "straight", rotation: 1, flipped: false },
    { row: 2, col: 2, type: "straight", rotation: 1, flipped: false, isEnd: true, ports: [{ side: "right", flow: "out" }] },
];

const LEVEL_2: BoardConfig[] = [
    { row: 0, col: 0, type: "straight", rotation: 1, flipped: false, isStart: true, ports: [{ side: "left", flow: "in" }] },
    { row: 0, col: 1, type: "tee", rotation: 0, flipped: false },
    { row: 0, col: 2, type: "corner", rotation: 2, flipped: false },
    { row: 1, col: 0, type: "corner", rotation: 0, flipped: false },
    { row: 1, col: 1, type: "cross", rotation: 0, flipped: false },
    { row: 1, col: 2, type: "corner", rotation: 1, flipped: false },
    { row: 2, col: 0, type: "straight", rotation: 0, flipped: false },
    { row: 2, col: 1, type: "corner", rotation: 3, flipped: false },
    { row: 2, col: 2, type: "tee", rotation: 2, flipped: false, isEnd: true, ports: [{ side: "right", flow: "out" }] },
];

const LEVEL_3: BoardConfig[] = [
    { row: 0, col: 0, type: "cross", rotation: 1, flipped: false, isStart: true, ports: [{ side: "left", flow: "in" }] },
    { row: 0, col: 1, type: "straight", rotation: 0, flipped: false },
    { row: 0, col: 2, type: "corner", rotation: 2, flipped: false },
    { row: 1, col: 0, type: "tee", rotation: 2, flipped: false },
    { row: 1, col: 1, type: "cross", rotation: 1, flipped: false },
    { row: 1, col: 2, type: "tee", rotation: 3, flipped: false },
    { row: 2, col: 0, type: "corner", rotation: 0, flipped: false },
    { row: 2, col: 1, type: "corner", rotation: 0, flipped: false },
    { row: 2, col: 2, type: "straight", rotation: 1, flipped: false, isEnd: true, ports: [{ side: "right", flow: "out" }] },
];

export const generateLevel = (level: number): BoardConfig[] => {
    let config: BoardConfig[];
    switch (level) {
        case 1:
            config = LEVEL_1;
            break;
        case 2:
            config = LEVEL_2;
            break;
        case 3:
            config = LEVEL_3;
            break;
        default:
            config = LEVEL_1;
    }

    // We return a deep copy to avoid mutating the static configs during play
    return JSON.parse(JSON.stringify(config));
};
