import {getFromStorage} from "@skedwards88/shared-components/src/logic/safeStorage";
import {convertStringToPuzzleAndFishIndexes} from "./convertStringToPuzzleAndFishIndexes";
import {puzzles} from "./puzzles";
import {validateSavedState} from "./validateSavedState";

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

type FeatureWithFish = keyof typeof featureToLetterLookup;

export type Feature = Exclude<FeatureWithFish, "fish">;

export type GameState = {
  level: number;
  puzzle: (Feature | null)[];
  remainingSwipes: number;
  fishHistory: number[][];
};

export function gameInit({
  level,
  useSaved,
}: {
  level?: number;
  useSaved?: boolean;
}): GameState {
  const savedState = useSaved
    ? getFromStorage<GameState>("currentsSavedState")
    : undefined;

  // If saved state matches the requested level (if any), use saved state
  if (
    (level === undefined || savedState?.level === level) &&
    savedState &&
    validateSavedState(savedState)
  ) {
    return savedState;
  }

  // If no level (or illegal level) was requested, use the saved level if able, else level 1
  if (
    !level ||
    !Number.isInteger(level) ||
    level < 1 ||
    level > puzzles.length
  ) {
    const savedLevel = savedState?.level;
    if (
      savedLevel &&
      Number.isInteger(savedLevel) &&
      savedLevel > 0 &&
      savedLevel <= puzzles.length
    ) {
      level = savedLevel;
    } else {
      level = 1;
    }
  }

  const [puzzleWithoutFish, startingFishIndexes] =
    convertStringToPuzzleAndFishIndexes(puzzles[level - 1].puzzleString);

  return {
    level, // -1 because 0-indexed
    remainingSwipes: puzzles[level - 1].maxSwipes,
    fishHistory: [startingFishIndexes],
    puzzle: puzzleWithoutFish,
  };
}
