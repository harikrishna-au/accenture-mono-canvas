import { MatrixShape } from "./MatrixShape";
import { TileType } from "./types";
import { StraightShape } from "./shapes/StraightShape";
import { CornerShape } from "./shapes/CornerShape";
import { TeeShape } from "./shapes/TeeShape";
import { CrossShape } from "./shapes/CrossShape";

export const createShape = (type: TileType, rotation = 0, flipped = false): MatrixShape => {
  switch (type) {
    case "straight":
      return new StraightShape(rotation, flipped);
    case "corner":
      return new CornerShape(rotation, flipped);
    case "tee":
      return new TeeShape(rotation, flipped);
    case "cross":
      return new CrossShape(rotation, flipped);
    default:
      throw new Error(`Unsupported shape ${type}`);
  }
};

