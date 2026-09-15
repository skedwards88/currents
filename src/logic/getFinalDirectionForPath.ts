import {type Direction} from "../components/Board";
import {type Feature, numColumns} from "./gameInit";
import {getDirectionBetweenIndexes} from "./getDirectionBetweenIndexes";

export function getFinalDirectionForPath(
  path: number[],
  puzzle: (Feature | null)[],
): Direction | null {
  const finalIndex = path[path.length - 1];

  // If the final index is a stream, return the direction of the stream
  if (puzzle[finalIndex] === "streamDown") {
    return "down";
  } else if (puzzle[finalIndex] === "streamUp") {
    return "up";
  } else if (puzzle[finalIndex] === "streamLeft") {
    return "left";
  } else if (puzzle[finalIndex] === "streamRight") {
    return "right";
  }

  // Otherwise, return the direction based on the diff between the last 2 adjacent (i.e. not whirlpool), different (i.e. not staying in place) indexes
  // Start from the last index and work backwards to the second index
  for (let metaIndex = path.length - 1; metaIndex > 0; metaIndex--) {
    const fishIndex = path[metaIndex];
    const previousFishIndex = path[metaIndex - 1];

    const movementDirection = getDirectionBetweenIndexes(
      previousFishIndex,
      fishIndex,
      numColumns,
    );

    if (movementDirection != null) {
      return movementDirection;
    }
  }

  return null;
}
