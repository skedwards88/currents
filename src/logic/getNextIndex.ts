import {type Direction} from "../components/Board";
import {numColumns, numRows} from "./gameInit";
import {indexToRow} from "./indexToRow";

export function getNextIndex(index: number, direction: Direction): number {
  if (index < 0 || index >= numColumns * numRows) {
    throw new Error(`index ${index} is out of bounds`);
  }

  switch (direction) {
    case "left": {
      const nextIndex = Math.max(0, index - 1);

      if (indexToRow(index, numColumns) != indexToRow(nextIndex, numColumns)) {
        return index;
      } else {
        return nextIndex;
      }
    }

    case "right": {
      const nextIndex = Math.min(index + 1, numColumns * numRows - 1);

      if (indexToRow(index, numColumns) != indexToRow(nextIndex, numColumns)) {
        return index;
      } else {
        return nextIndex;
      }
    }

    case "up": {
      return index - numColumns >= 0 ? index - numColumns : index;
    }

    case "down": {
      return index + numColumns < numColumns * numRows
        ? index + numColumns
        : index;
    }

    default: {
      // Fails if any direction is not covered by the cases above
      const exhaustiveCheck: never = direction;

      throw new Error(`unknown direction ${String(exhaustiveCheck)}`);
    }
  }
}
