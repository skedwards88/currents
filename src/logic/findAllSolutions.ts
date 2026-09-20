import {arraysMatchQ} from "@skedwards88/word_logic";
import {allDirections, type Direction} from "../components/Board";
import {type GameState} from "./gameInit";
import {getFishIndexUpdates} from "./getFishIndexUpdates";
import {levelCompleteQ} from "./levelCompleteQ";

type Solution = {
  fishHistory: GameState["fishHistory"];
  swipes: Direction[];
  animationSteps: number[][][];
};

// Returns lists of fish histories, swipe directions, and animation steps that lead to a solution
export function findAllSolutions({
  startingFishIndexes,
  puzzle,
  maxSwipes,
}: {
  startingFishIndexes: GameState["fishHistory"][0];
  puzzle: GameState["puzzle"];
  maxSwipes: GameState["maxSwipes"];
}): Solution[] {
  // [GameState["fishHistory"], Direction[], number[][]][]
  const initialFishHistory = [startingFishIndexes];
  const initialDirections: Direction[] = [];
  const initialAnimationSteps: number[][][] = [];

  const solutions: Solution[] = [];

  function extendPath(
    currentFishHistory: number[][],
    currentStartingDirections: Direction[],
    currentAnimationSteps: number[][][],
  ): void {
    const startingFishIndexes =
      currentFishHistory[currentFishHistory.length - 1];

    // If solved, record and return
    if (levelCompleteQ(startingFishIndexes, puzzle)) {
      solutions.push({
        fishHistory: currentFishHistory,
        swipes: currentStartingDirections,
        animationSteps: currentAnimationSteps,
      });
      return;
    }

    // If out of swipes, return
    if (currentFishHistory.length > maxSwipes) {
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
        currentFishHistory.some((priorFishIndexes) =>
          arraysMatchQ(priorFishIndexes, newFishIndexes),
        )
      ) {
        continue;
      }

      // Otherwise, recurse
      extendPath(
        [...currentFishHistory, newFishIndexes],
        [...currentStartingDirections, direction],
        [...currentAnimationSteps, animationSteps],
      );
    }
  }

  extendPath(initialFishHistory, initialDirections, initialAnimationSteps);

  return solutions;
}
