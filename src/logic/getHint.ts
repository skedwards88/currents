import {arraysMatchQ} from "@skedwards88/word_logic";
import {type Direction} from "../components/Board";
import {findAllSolutions} from "./findAllSolutions";
import {type GameState} from "./gameInit";

function findArrayMatchLength<
  T extends string | number | boolean | null | undefined,
>(arrayA: T[][], arrayB: T[][]): number {
  let score = 0;

  for (let index = 0; index < arrayA.length; index++) {
    if (arraysMatchQ(arrayA[index], arrayB[index])) {
      score++;
    } else {
      break;
    }
  }
  return score;
}

export function getHint({
  playedFishHistory,
  puzzle,
  maxSwipes,
}: {
  playedFishHistory: GameState["fishHistory"];
  puzzle: GameState["puzzle"];
  maxSwipes: GameState["remainingSwipes"];
}): [GameState["fishHistory"], Direction] {
  const startingFishIndexes = playedFishHistory[0];

  // Find all solutions
  const solutions = findAllSolutions({
    startingFishIndexes,
    puzzle,
    maxSwipes,
  });
  console.log(JSON.stringify(solutions));
  // Find each solution history, find how many steps match the played history before they diverge
  const scores = solutions.map((solution) =>
    findArrayMatchLength(playedFishHistory, solution[0]),
  );

  // Find the solutions that match the played history for the longest
  const maxScore = Math.max(...scores);
  const bestSolutions = solutions.filter(
    (_, index) => scores[index] === maxScore,
  );

  // Just pick the first of the best
  // Not bothering to find the shortest solution, since they should all be the same length based on the puzzles validation
  const [solutionHistory, solutionDirections] = bestSolutions[0];

  // If the max score equals the current history length, just extend the current history by 1
  // Otherwise, backtrack to where the paths diverged and then extend by 1
  if (maxScore === playedFishHistory.length) {
    return [playedFishHistory, solutionDirections[maxScore - 1]];
  } else {
    const newHistory = solutionHistory.slice(0, maxScore);

    const nextDirection = solutionDirections[maxScore - 1];
    return [newHistory, nextDirection];
  }
}
