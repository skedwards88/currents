import {numColumns, numRows} from "./gameInit";
import {validPuzzleStringQ} from "./validPuzzleStringQ";

describe("validPuzzleStringQ", () => {
  test("errors if string contains unknown symbol", () => {
    const puzzleString = "FFDRPNS";

    expect(() => validPuzzleStringQ(puzzleString)).toThrow(
      "Letter D not found in featureToLetterLookup",
    );
  });

  test("errors if puzzle string exceeds board size", () => {
    const puzzleString = "F64C";

    expect(() => validPuzzleStringQ(puzzleString)).toThrow(
      `Input array length (66) exceeds target length (${numColumns * numRows})`,
    );
  });

  test("errors if contains not 0 or 2 whirlpools", () => {
    const puzzleString = "F6PC";

    expect(() => validPuzzleStringQ(puzzleString)).toThrow(
      `Puzzle ${puzzleString} has 1 instead of 0 or 2 whirlpools`,
    );

    const puzzleString2 = "F6PPCP";

    expect(() => validPuzzleStringQ(puzzleString2)).toThrow(
      `Puzzle ${puzzleString2} has 3 instead of 0 or 2 whirlpools`,
    );
  });

  test("errors if fewer corals than fish", () => {
    const puzzleString = "FFC";

    expect(() => validPuzzleStringQ(puzzleString)).toThrow(
      `Puzzle ${puzzleString} has less corals (1) than fish (2)`,
    );
  });

  test("more corals than fish is allowed", () => {
    expect(validPuzzleStringQ("FCC")).toBe(true);
  });

  test("true if it didn't hit any errors", () => {
    expect(validPuzzleStringQ("FC")).toBe(true);
  });
});
