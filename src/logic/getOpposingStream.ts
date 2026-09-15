import {type Direction} from "../components/Board";

export function getOpposingStream(
  direction: Direction,
): "streamUp" | "streamDown" | "streamLeft" | "streamRight" {
  switch (direction) {
    case "up":
      return "streamDown";
    case "down":
      return "streamUp";
    case "right":
      return "streamLeft";
    case "left":
      return "streamRight";

    default: {
      // Fails if any direction is not covered by the cases above
      const exhaustiveCheck: never = direction;

      throw new Error(`no opposing stream for ${String(exhaustiveCheck)}`);
    }
  }
}
