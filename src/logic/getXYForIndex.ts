import {indexToColumn} from "@skedwards88/word_logic";
import {indexToRow} from "@skedwards88/word_logic";

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
