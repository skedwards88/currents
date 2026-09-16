import {convertStringToPuzzleAndFishIndexes} from "./convertStringToPuzzleAndFishIndexes";
import {numColumns, numRows} from "./gameInit";

export function validPuzzleStringQ(puzzleString: string): boolean {
  const [puzzle, fishIndexes] =
    convertStringToPuzzleAndFishIndexes(puzzleString);

  if (puzzle.length != numColumns * numRows) {
    throw new Error(
      `Puzzle ${puzzleString} results in a puzzle that doesn't match board size`,
    );
  }

  const numWhirlpools = puzzle.filter(
    (feature) => feature === "whirlpool",
  ).length;

  if (numWhirlpools != 0 && numWhirlpools != 2) {
    throw new Error(
      `Puzzle ${puzzleString} has ${numWhirlpools} instead of 0 or 2 whirlpools`,
    );
  }

  const numCorals = puzzle.filter((feature) => feature === "coral").length;

  if (numCorals < fishIndexes.length) {
    throw new Error(
      `Puzzle ${puzzleString} has less corals (${numCorals}) than fish (${fishIndexes.length})`,
    );
  }

  return true;
}
