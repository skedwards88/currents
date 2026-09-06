import {convertStringToPuzzle} from "./convertStringToPuzzle";

describe("convertStringToPuzzle", () => {
  test("converts a string to a puzzle", () => {
    const puzzleString = "12FF3RPN13S";

    const puzzle = convertStringToPuzzle(puzzleString);

    expect(puzzle).toEqual([
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      ["fish"],
      ["fish"],
      [],
      [],
      [],
      ["rock"],
      ["whirlpool"],
      ["streamUp"],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      ["streamDown"],
      [],
    ]);
  });

  test("empty string gives empty puzzle", () => {
    const puzzleString = "";

    const puzzle = convertStringToPuzzle(puzzleString);

    expect(puzzle).toEqual(Array.from({length: 35}, () => []));
  });

  test("puzzle is padded with empty spaces at the end to reach 35 in length", () => {
    const puzzleString = "3F2R3";

    const puzzle = convertStringToPuzzle(puzzleString);

    expect(puzzle.length).toBe(35);
  });

  test("works if the puzzle string is only numbers", () => {
    const puzzleString = "2";

    const puzzle = convertStringToPuzzle(puzzleString);

    expect(puzzle).toEqual(Array.from({length: 35}, () => []));
  });

  test("works if the puzzle string is only features", () => {
    const puzzleString = "FFRPNS";

    const puzzle = convertStringToPuzzle(puzzleString);

    expect(puzzle).toEqual([
      ["fish"],
      ["fish"],
      ["rock"],
      ["whirlpool"],
      ["streamUp"],
      ["streamDown"],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
    ]);
  });

  test("errors if string contains unknown symbol", () => {
    const puzzleString = "FFDRPNS";

    expect(() => convertStringToPuzzle(puzzleString)).toThrow(
      "Letter D not found in featureToLetterLookup",
    );
  });
});
