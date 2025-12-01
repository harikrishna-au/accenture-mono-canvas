import { Connector, Direction, invertFlow, rotateDirection } from "../directions";
import { Matrix3x3 } from "../types";
import { MatrixShape } from "../MatrixShape";

export class TeeShape extends MatrixShape {
  readonly type = "tee";

  readonly isHub = false;

  constructor(rotation = 0, flipped = false, disabledPorts: Direction[] = ["up"]) {
    super(rotation, flipped, disabledPorts.length > 0 ? disabledPorts : ["up"]);
  }

  protected baseConnectors: Connector[] = []; // Not used due to override

  protected spawn(rotation: number, flipped: boolean, disabledPorts: Direction[]): MatrixShape {
    return new TeeShape(rotation, flipped, disabledPorts);
  }

  getConnectors(): Connector[] {
    const disabled = this.disabledPorts[0];
    let connectors: Connector[] = [];

    // Define base flow (before rotation/flip)
    // 1. Straight (Left-Right) -> Disable UP
    if (!disabled || disabled === "up") {
      connectors = [{ side: "left", flow: "in" }, { side: "right", flow: "out" }];
    }
    // 2. L (Left-Up) -> Disable RIGHT
    else if (disabled === "right") {
      connectors = [{ side: "left", flow: "in" }, { side: "up", flow: "out" }];
    }
    // 3. L (Right-Up) -> Disable LEFT
    else {
      connectors = [{ side: "right", flow: "in" }, { side: "up", flow: "out" }];
    }

    return connectors.map(({ side, flow }) => ({
      side: rotateDirection(side, this.rotation),
      flow: this.flipped ? invertFlow(flow) : flow,
    }));
  }

  cycleConfiguration(): MatrixShape {
    // States (Base T points UP, LEFT, RIGHT):
    // 1. Straight (Left-Right) -> Disable UP
    // 2. L (Up-Left) -> Disable RIGHT
    // 3. L (Up-Right) -> Disable LEFT

    const currentDisabled = this.disabledPorts[0];
    let nextDisabled: Direction;

    // Default or if UP is disabled -> Disable RIGHT
    if (!currentDisabled || currentDisabled === "up") {
      nextDisabled = "right";
    } else if (currentDisabled === "right") {
      nextDisabled = "left";
    } else {
      nextDisabled = "up";
    }

    return this.spawn(this.rotation, this.flipped, [nextDisabled]);
  }
}
