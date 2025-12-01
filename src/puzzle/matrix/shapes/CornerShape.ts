import { Connector, Direction } from "../directions";
import { Matrix3x3 } from "../types";
import { MatrixShape } from "../MatrixShape";

export class CornerShape extends MatrixShape {
  readonly type = "corner";

  readonly isHub = false;

  protected baseConnectors: Connector[] = [
    { side: "left", flow: "in" },
    { side: "down", flow: "out" },
  ];

  protected spawn(rotation: number, flipped: boolean, disabledPorts: Direction[]): MatrixShape {
    return new CornerShape(rotation, flipped, disabledPorts);
  }
}

