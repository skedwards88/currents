import {convertStringToPuzzleAndFishIndexes} from "./convertStringToPuzzleAndFishIndexes";
import {numColumns, numRows} from "./gameInit";

describe("convertStringToPuzzleAndFishIndexes", () => {
  test("converts a string to a puzzle", () => {
    const puzzleString = "12FF3RPN13S";

    const [puzzle, fishIndexes] =
      convertStringToPuzzleAndFishIndexes(puzzleString);

    expect(fishIndexes).toEqual([12, 13]);
    expect(puzzle).toEqual([
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      "rock",
      "whirlpool",
      "streamUp",
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      "streamDown",
      null,
    ]);
  });

  test("empty string gives empty puzzle", () => {
    const puzzleString = "";

    const [puzzle, fishIndexes] =
      convertStringToPuzzleAndFishIndexes(puzzleString);

    expect(puzzle).toEqual(
      Array.from({length: numColumns * numRows}, () => null),
    );
    expect(fishIndexes).toEqual([]);
  });

  test("puzzle is padded with empty spaces at the end to reach (numColumns * numRows) in length", () => {
    const puzzleString = "3F2R3";

    const [puzzle, _] = convertStringToPuzzleAndFishIndexes(puzzleString);

    expect(puzzle.length).toBe(numColumns * numRows);
  });

  test("works if the puzzle string is only numbers", () => {
    const puzzleString = "2";

    const [puzzle, fishIndexes] =
      convertStringToPuzzleAndFishIndexes(puzzleString);

    expect(puzzle).toEqual(
      Array.from({length: numColumns * numRows}, () => null),
    );
    expect(fishIndexes).toEqual([]);
  });

  test("works if the puzzle string is only features", () => {
    const puzzleString = "FFRPNS";

    const [puzzle, fishIndexes] =
      convertStringToPuzzleAndFishIndexes(puzzleString);

    expect(fishIndexes).toEqual([0, 1]);
    expect(puzzle).toEqual([
      null,
      null,
      "rock",
      "whirlpool",
      "streamUp",
      "streamDown",
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ]);
  });

  test("errors if string contains unknown symbol", () => {
    const puzzleString = "FFDRPNS";

    expect(() => convertStringToPuzzleAndFishIndexes(puzzleString)).toThrow(
      "Letter D not found in featureToLetterLookup",
    );
  });
});
