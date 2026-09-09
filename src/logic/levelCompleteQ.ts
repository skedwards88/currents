import type {GameState} from "./gameInit";

export function levelCompleteQ(
  fishIndexes: GameState["fishHistory"][0],
  puzzle: GameState["puzzle"],
): boolean {
  // Level is complete if all fish are on a coral
  return fishIndexes.every((index) => puzzle[index] === "coral");
}
