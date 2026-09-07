import {
  type Feature,
  letterToFeatureLookup,
  numColumns,
  numRows,
} from "./gameInit";

function padArray<T>(inputArray: T[], targetLength: number, fillValue: T): T[] {
  return Array.from({length: targetLength}, (_, i) =>
    i < inputArray.length ? inputArray[i] : fillValue,
  );
}

export function convertStringToPuzzleAndFishIndexes(
  puzzleString: string,
): [(Feature | null)[], number[]] {
  // Non-letter/numbers are omitted. Consecutive numbers are kept together.
  const symbols = (puzzleString.match(/\d+|[A-Za-z]/g) ?? []).map((item) =>
    /^\d+$/.test(item) ? Number(item) : item,
  );

  let puzzle: (Feature | null)[] = [];
  const fishIndexes: number[] = [];

  for (const symbol of symbols) {
    if (typeof symbol === "number") {
      puzzle = puzzle.concat(Array.from({length: symbol}, () => null));
    } else {
      const feature = letterToFeatureLookup[symbol];

      if (!feature) {
        throw new Error(`Letter ${symbol} not found in featureToLetterLookup`);
      }

      if (feature === "fish") {
        fishIndexes.push(puzzle.length);
        puzzle.push(null);
      } else {
        puzzle.push(feature as Feature); // the alternative to type casting here seems to be a bunch of convoluted hoops that don't add much value beyond just getting rid of TS errors
      }
    }
  }

  return [padArray(puzzle, numColumns * numRows, null), fishIndexes];
}
