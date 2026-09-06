import {type Direction} from "../components/Game";
import {numColumns, numRows} from "./gameInit";

// Gets the row index of an index in a flat array assuming the array represents a grid of the specified number of columns
function getRowIndex(index: number, numColumns: number): number {
  return Math.floor(index / numColumns);
}

export function getNextIndex(index: number, direction: Direction): number {
  if (index < 0 || index >= numColumns * numRows) {
    throw new Error(`index ${index} is out of bounds`);
  }

  switch (direction) {
    case "left": {
      const nextIndex = Math.max(0, index - 1);

      if (
        getRowIndex(index, numColumns) != getRowIndex(nextIndex, numColumns)
      ) {
        return index;
      } else {
        return nextIndex;
      }
    }

    case "right": {
      const nextIndex = Math.min(index + 1, numColumns * numRows - 1);

      if (
        getRowIndex(index, numColumns) != getRowIndex(nextIndex, numColumns)
      ) {
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
