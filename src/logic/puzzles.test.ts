import {convertStringToPuzzleAndFishIndexes} from "./convertStringToPuzzleAndFishIndexes";
import {findAllSolutions} from "./findAllSolutions";
import {puzzles} from "./puzzles";
import {validPuzzleStringQ} from "./validPuzzleStringQ";

describe("puzzle validation", () => {
  const verbose = true;

  test("every puzzle string is valid", () => {
    puzzles.forEach((puzzle) => {
      expect(validPuzzleStringQ(puzzle.puzzleString)).toBe(true);
    });
  });

  test("every puzzle has a solution, and no solution is greater than max swipes", () => {
    puzzles.forEach((puzzleData) => {
      const [puzzle, startingFishIndexes] = convertStringToPuzzleAndFishIndexes(
        puzzleData.puzzleString,
      );

      const maxSwipes = puzzleData.maxSwipes;

      const solutions = findAllSolutions({
        startingFishIndexes,
        puzzle,
        maxSwipes,
      });

      if (verbose) {
        console.log(
          `Puzzle ${puzzleData.puzzleString}:\n${solutions.map((solution) => solution.swipes).join("\n")}`,
        );
      }

      expect(solutions.length).toBeGreaterThan(0);

      solutions.forEach(({swipes}) => {
        if (verbose && swipes.length != maxSwipes) {
          throw new Error(
            `${puzzleData.puzzleString} does not require ${maxSwipes} swipes: ${JSON.stringify(swipes)} (${swipes.length} swipes)`,
          );
        }
        expect(swipes.length).toBe(maxSwipes);
      });
    });
  });
});
