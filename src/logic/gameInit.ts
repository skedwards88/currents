import {convertStringToPuzzleAndFishIndexes} from "./convertStringToPuzzleAndFishIndexes";
import {puzzles} from "./puzzles";

export const numRows = 7;
export const numColumns = 5;

export const featureToLetterLookup = {
  fish: "F",
  coral: "C",
  rock: "R",
  whirlpool: "P",
  streamUp: "N",
  streamDown: "S",
  streamLeft: "W",
  streamRight: "E",
};

export const letterToFeatureLookup = Object.fromEntries(
  Object.entries(featureToLetterLookup).map(([feature, letter]) => [
    letter,
    feature,
  ]),
);

export type Feature = keyof typeof featureToLetterLookup;

export type GameState = {
  level: number;
  puzzle: (Feature | null)[];
  remainingSweeps: number;
  fishHistory: number[][];
};

export function gameInit({level}: {level: number}): GameState {
  const [puzzleWithoutFish, startingFishIndexes] =
    convertStringToPuzzleAndFishIndexes(puzzles[level - 1].puzzleString);

  return {
    level, // -1 because 0-indexed
    remainingSweeps: puzzles[level - 1].maxSweeps,
    fishHistory: [startingFishIndexes],
    puzzle: puzzleWithoutFish,
  };
}
