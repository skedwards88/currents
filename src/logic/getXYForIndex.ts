import {indexToColumn} from "./indexToColumn";
import {indexToRow} from "./indexToRow";

export function getXYForIndex(
  index: number,
  squareWidth: number,
  numColumns: number,
): {x: number; y: number} {
  const colIndex = indexToColumn(index, numColumns);
  const rowIndex = indexToRow(index, numColumns);

  const indexX = squareWidth * colIndex;
  const indexY = squareWidth * rowIndex;

  return {x: indexX, y: indexY};
}
