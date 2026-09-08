import type {Feature} from "./gameInit";

export function levelCompleteQ(
  fishIndexes: number[],
  puzzle: (Feature | null)[],
): boolean {
  // Level is complete if all fish are on a coral
  return fishIndexes.every((index) => puzzle[index] === "coral");
}
