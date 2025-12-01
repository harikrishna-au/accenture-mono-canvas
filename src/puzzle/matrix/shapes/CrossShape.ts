import { Connector, Direction, rotateDirection, invertFlow } from "../directions";
import { Matrix3x3 } from "../types";
import { MatrixShape } from "../MatrixShape";

export class CrossShape extends MatrixShape {
  readonly type = "cross";

  readonly isHub = false;

  constructor(rotation = 0, flipped = false, disabledPorts: Direction[] = ["up", "down"]) {
    super(rotation, flipped, disabledPorts.length > 0 ? disabledPorts : ["up", "down"]);
  }

  protected baseConnectors: Connector[] = []; // Not used due to override

  protected spawn(rotation: number, flipped: boolean, disabledPorts: Direction[]): MatrixShape {
    return new CrossShape(rotation, flipped, disabledPorts);
  }

  getConnectors(): Connector[] {
    // Determine active ports based on disabled ports
    // We expect exactly 2 disabled ports for a valid path (1-in, 1-out)
    // But we need to define the flow.
    // Let's infer flow from the "missing" ports.
    // Actually, we can just define the 6 states explicitly in cycleConfiguration
    // and here we map the active ports to IN/OUT.

    // To keep it simple and consistent with Tee/Straight:
    // We can just define the flow based on the "shape" formed by active ports.
    // But wait, "Straight" and "L" have specific flow directions (e.g. Left->Right vs Right->Left).
    // The `flipped` property handles the flow reversal.
    // So we just need to define the "base" flow for each shape.

    const allPorts: Direction[] = ["up", "down", "left", "right"];
    const activePorts = allPorts.filter(p => !this.disabledPorts.includes(p));

    // If not exactly 2 active ports, fallback (shouldn't happen with correct cycle logic)
    if (activePorts.length !== 2) {
      return [];
    }

    const [p1, p2] = activePorts;

    // Define a canonical flow for each pair.
    // We can say p1 is IN, p2 is OUT.
    // But we need to be consistent with "Straight" and "Corner" shapes if we want to match them.
    // Straight: Left -> Right (Horizontal), Up -> Down (Vertical)
    // Corner: Left -> Up, etc.

    // Let's just define p1 as IN, p2 as OUT, and let `flipped` swap them.
    // To ensure consistency, let's sort them or pick a standard order.
    // Order: up, down, left, right

    // Pairs:
    // Up, Down (Vertical) -> Up IN, Down OUT? (StraightShape is Up->Down?)
    // Up, Left (L) -> Left IN, Up OUT?
    // Up, Right (L) -> Right IN, Up OUT?
    // Down, Left (L) -> Left IN, Down OUT?
    // Down, Right (L) -> Right IN, Down OUT?
    // Left, Right (Horizontal) -> Left IN, Right OUT

    // Let's map active ports to connectors.
    // We need to assign flow.

    let connectors: Connector[] = [];

    const has = (d: Direction) => activePorts.includes(d);

    if (has("left") && has("right")) {
      connectors = [{ side: "left", flow: "in" }, { side: "right", flow: "out" }];
    } else if (has("up") && has("down")) {
      connectors = [{ side: "up", flow: "in" }, { side: "down", flow: "out" }];
    } else if (has("left") && has("up")) {
      connectors = [{ side: "left", flow: "in" }, { side: "up", flow: "out" }];
    } else if (has("right") && has("up")) {
      connectors = [{ side: "right", flow: "in" }, { side: "up", flow: "out" }];
    } else if (has("left") && has("down")) {
      connectors = [{ side: "left", flow: "in" }, { side: "down", flow: "out" }];
    } else if (has("right") && has("down")) {
      connectors = [{ side: "right", flow: "in" }, { side: "down", flow: "out" }];
    }

    return connectors.map(({ side, flow }) => ({
      side: rotateDirection(side, this.rotation),
      flow: this.flipped ? invertFlow(flow) : flow,
    }));
  }

  cycleConfiguration(): MatrixShape {
    // 6 States (Active Ports):
    // 1. Horizontal (Left, Right) -> Disable Up, Down
    // 2. Vertical (Up, Down) -> Disable Left, Right
    // 3. L-Up-Right (Up, Right) -> Disable Left, Down
    // 4. L-Down-Right (Down, Right) -> Disable Left, Up
    // 5. L-Down-Left (Down, Left) -> Disable Right, Up
    // 6. L-Up-Left (Up, Left) -> Disable Right, Down

    const disabled = this.disabledPorts;
    const isDisabled = (d: Direction) => disabled.includes(d);

    let nextDisabled: Direction[];

    // Logic to cycle 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 1
    if (isDisabled("up") && isDisabled("down")) {
      // 1 -> 2: Vertical
      nextDisabled = ["left", "right"];
    } else if (isDisabled("left") && isDisabled("right")) {
      // 2 -> 3: L-Up-Right
      nextDisabled = ["left", "down"];
    } else if (isDisabled("left") && isDisabled("down")) {
      // 3 -> 4: L-Down-Right
      nextDisabled = ["left", "up"];
    } else if (isDisabled("left") && isDisabled("up")) {
      // 4 -> 5: L-Down-Left
      nextDisabled = ["right", "up"];
    } else if (isDisabled("right") && isDisabled("up")) {
      // 5 -> 6: L-Up-Left
      nextDisabled = ["right", "down"];
    } else {
      // 6 -> 1: Horizontal (Default)
      nextDisabled = ["up", "down"];
    }

    return this.spawn(this.rotation, this.flipped, nextDisabled);
  }
}

