import {puzzles} from "./puzzles";
import {validPuzzleStringQ} from "./validPuzzleStringQ";

describe("puzzle validation", () => {
  test("every puzzle string is valid", () => {
    puzzles.forEach((puzzle) => {
      expect(validPuzzleStringQ(puzzle.puzzleString)).toBe(true);
    });
  });
});
