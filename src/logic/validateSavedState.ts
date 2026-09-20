import {arraysMatchQ} from "@skedwards88/word_logic";
import {convertStringToPuzzleAndFishIndexes} from "./convertStringToPuzzleAndFishIndexes";
import {type GameState, numColumns, numRows} from "./gameInit";
import {puzzles} from "./puzzles";

export function validateSavedState(savedState: GameState): boolean {
  if (typeof savedState !== "object" || savedState === null) {
    return false;
  }

  if (
    !Number.isInteger(savedState.level) ||
    savedState.level < 1 ||
    savedState.level > puzzles.length
  ) {
    return false;
  }

  if (!Number.isInteger(savedState.maxSwipes) || savedState.maxSwipes < 0) {
    return false;
  }

  if (!Number.isInteger(savedState.hintCount) || savedState.hintCount < 0) {
    return false;
  }

  if (savedState?.puzzle.length != numColumns * numRows) {
    return false;
  }

  const [officialPuzzle, officialFishIndexes] =
    convertStringToPuzzleAndFishIndexes(
      puzzles[savedState.level - 1].puzzleString, // -1 because 0-indexed
    );

  if (!arraysMatchQ(savedState?.puzzle, officialPuzzle)) {
    return false;
  }

  if (
    !savedState.fishHistory.every(
      (fishIndexes) =>
        fishIndexes.length === officialFishIndexes.length &&
        fishIndexes.every(
          (fishIndex) =>
            Number.isInteger(fishIndex) &&
            fishIndex >= 0 &&
            fishIndex < numColumns * numRows,
        ),
    )
  ) {
    return false;
  }

  return true;
}
