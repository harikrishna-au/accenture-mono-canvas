export type Direction = "up" | "right" | "down" | "left";

export type Flow = "in" | "out";

export interface Connector {
  side: Direction;
  flow: Flow;
}

export const DIRECTIONS: Direction[] = ["up", "right", "down", "left"];

export const DIRECTION_INDEX: Record<Direction, number> = {
  up: 0,
  right: 1,
  down: 2,
  left: 3,
};

export const OPPOSITE: Record<Direction, Direction> = {
  up: "down",
  right: "left",
  down: "up",
  left: "right",
};

export const OFFSETS: Record<Direction, { row: number; col: number }> = {
  up: { row: -1, col: 0 },
  right: { row: 0, col: 1 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
};

export const rotateDirection = (direction: Direction, steps: number): Direction => {
  const nextIndex = (DIRECTION_INDEX[direction] + steps + 4) % 4;
  return DIRECTIONS[nextIndex];
};

export const invertFlow = (flow: Flow): Flow => (flow === "in" ? "out" : "in");

export const directionLabel = (dir: Direction) => {
  switch (dir) {
    case "up":
      return "north";
    case "right":
      return "east";
    case "down":
      return "south";
    case "left":
      return "west";
  }
};

