import { Connector } from "../directions";
import { Matrix3x3 } from "../types";
import { MatrixShape } from "../MatrixShape";

export class TeeShape extends MatrixShape {
  readonly type = "tee";

  readonly isHub = true;

  protected baseConnectors: Connector[] = [
    { side: "down", flow: "in" },
    { side: "left", flow: "out" },
    { side: "right", flow: "out" },
  ];

  protected spawn(rotation: number, flipped: boolean): MatrixShape {
    return new TeeShape(rotation, flipped);
  }
}

