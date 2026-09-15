import {type Direction} from "../components/Board";
import {type GameState} from "./gameInit";
import {getNextIndex} from "./getNextIndex";
import {getOpposingStream} from "./getOpposingStream";

export function fishPushValidQ({
  direction,
  pushedFishMetaIndex,
  fishIndexes,
  puzzle,
}: {
  direction: Direction;
  pushedFishMetaIndex: number; // index of the fish within fishIndexes, not within board
  fishIndexes: GameState["fishHistory"][0];
  puzzle: GameState["puzzle"];
}): boolean {
  const pushedFishIndex = fishIndexes[pushedFishMetaIndex];

  const targetIndex = getNextIndex(pushedFishIndex, direction);

  // If target index is same as starting index, then fish is pushed into the edge and can't move
  if (targetIndex === pushedFishIndex) {
    return false;
  }

  // Can't push into a rock
  if (puzzle[targetIndex] === "rock") {
    return false;
  }

  // Can't push into an opposing stream
  const opposingStream = getOpposingStream(direction);
  if (puzzle[targetIndex] === opposingStream) {
    return false;
  }

  // If there is a fish at the target index:
  if (fishIndexes.includes(targetIndex)) {
    // If the second fish is in a stream or whirlpool, return false since you can't push a fish out of a stream or whirlpool
    const elementAtTargetIndex = puzzle[targetIndex];
    if (
      elementAtTargetIndex === "streamDown" ||
      elementAtTargetIndex === "streamUp" ||
      elementAtTargetIndex === "streamLeft" ||
      elementAtTargetIndex === "streamRight" ||
      elementAtTargetIndex === "whirlpool"
    ) {
      return false;
    }

    // Otherwise, get the valid push result for that fish instead
    const targetMetaIndex = fishIndexes.findIndex((i) => i === targetIndex);
    return fishPushValidQ({
      direction,
      pushedFishMetaIndex: targetMetaIndex,
      fishIndexes,
      puzzle,
    });
  }

  return true;
}
