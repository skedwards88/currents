import {arraysMatchQ} from "@skedwards88/word_logic";
import {allDirections, type Direction} from "../components/Board";
import {type GameState} from "./gameInit";
import {getFishIndexUpdates} from "./getFishIndexUpdates";
import {levelCompleteQ} from "./levelCompleteQ";

// Returns tuples of fish histories and swipe directions that lead to a solution
export function findAllSolutions({
  startingFishIndexes,
  puzzle,
  maxSwipes,
}: {
  startingFishIndexes: GameState["fishHistory"][0];
  puzzle: GameState["puzzle"];
  maxSwipes: GameState["maxSwipes"];
}): [GameState["fishHistory"], Direction[]][] {
  const initialFishHistory = [startingFishIndexes];
  const initialDirections: Direction[] = [];

  const solutions: [number[][], Direction[]][] = [];

  function extendPath(
    startingFishHistory: number[][],
    startingDirections: Direction[],
  ): void {
    const startingFishIndexes =
      startingFishHistory[startingFishHistory.length - 1];

    // If solved, record and return
    if (levelCompleteQ(startingFishIndexes, puzzle)) {
      solutions.push([startingFishHistory, startingDirections]);
      return;
    }

    // If out of swipes, return
    if (startingFishHistory.length > maxSwipes) {
      return;
    }

    for (const direction of allDirections) {
      const animationSteps = getFishIndexUpdates({
        startingFishIndexes: startingFishIndexes,
        puzzle,
        direction,
      });

      const newFishIndexes = animationSteps[animationSteps.length - 1];

      // If swipe did nothing, abort this path and skip to the next direction
      if (arraysMatchQ(newFishIndexes, startingFishIndexes)) {
        continue;
      }

      // If the fish are where they've been previously, abort this path and skip to the next direction (because a path that loops on itself is not the shortest path)
      if (
        startingFishHistory.some((priorFishIndexes) =>
          arraysMatchQ(priorFishIndexes, newFishIndexes),
        )
      ) {
        continue;
      }

      // Otherwise, recurse
      extendPath(
        [...startingFishHistory, newFishIndexes],
        [...startingDirections, direction],
      );
    }
  }

  extendPath(initialFishHistory, initialDirections);

  return solutions;
}
