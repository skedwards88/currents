import {convertStringToPuzzle} from "./convertStringToPuzzle";
import {puzzles} from "./puzzles";

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
  puzzleHistory: Feature[][][];
  remainingSweeps: number;
};

export function gameInit({level}: {level: number}): GameState {
  const puzzle = convertStringToPuzzle(puzzles[level - 1].puzzleString);

  return {
    level, // -1 because 0-indexed
    remainingSweeps: puzzles[level - 1].maxSweeps,
    puzzleHistory: [puzzle],
  };
}
