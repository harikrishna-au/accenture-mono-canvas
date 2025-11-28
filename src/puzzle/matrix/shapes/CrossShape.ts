import { Connector } from "../directions";
import { Matrix3x3 } from "../types";
import { MatrixShape } from "../MatrixShape";

export class CrossShape extends MatrixShape {
  readonly type = "cross";

  readonly isHub = true;

  protected baseConnectors: Connector[] = [
    { side: "left", flow: "in" },
    { side: "right", flow: "out" },
    { side: "up", flow: "in" },
    { side: "down", flow: "out" },
  ];

  protected spawn(rotation: number, flipped: boolean): MatrixShape {
    return new CrossShape(rotation, flipped);
  }
}

