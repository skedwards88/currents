import {type Direction} from "../components/Board";
import {indexToColumn} from "./indexToColumn";
import {indexToRow} from "./indexToRow";

export function getDirectionBetweenIndexes(
  fromIndex: number,
  toIndex: number,
  numColumns: number,
): Direction | null {
  if (fromIndex === toIndex) {
    return null;
  }

  const fromColumn = indexToColumn(fromIndex, numColumns);
  const toColumn = indexToColumn(toIndex, numColumns);
  const fromRow = indexToRow(fromIndex, numColumns);
  const toRow = indexToRow(toIndex, numColumns);

  // If both the column and row changed, or either change was > 1, then a whirlpool was involved
  // (A whirlpool could still be involved otherwise, but would be an adjacent whirlpool and will just be treated as a normal adjacent move)
  if (
    (fromColumn != toColumn && fromRow != toRow) ||
    Math.abs(fromColumn - toColumn) > 1 ||
    Math.abs(fromRow - toRow) > 1
  ) {
    return null;
  }

  if (fromColumn < toColumn) {
    return "right";
  }

  if (fromColumn > toColumn) {
    return "left";
  }

  if (fromRow < toRow) {
    return "down";
  }

  if (fromRow > toRow) {
    return "up";
  }

  // this should never be reached
  return null;
}
