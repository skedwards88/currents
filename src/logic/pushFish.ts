import {type Direction} from "../components/Board";
import {fishPushValidQ} from "./fishPushValidQ";
import {type GameState} from "./gameInit";
import {getNextIndex} from "./getNextIndex";

export function pushFish({
  direction,
  pushedFishMetaIndex,
  fishIndexes,
  puzzle,
  validateChain = true,
}: {
  direction: Direction;
  pushedFishMetaIndex: number; // index of the fish within fishIndexes, not within board
  fishIndexes: GameState["fishHistory"][0];
  puzzle: GameState["puzzle"];
  validateChain?: boolean;
}): GameState["fishHistory"][0] {
  // Push a fish in a direction. If a fish is in the new location, push that fish as well
  // Doesn't push the fish if any fish in the chain of pushing can't be pushed

  // The validateChain param allows the validation check to be short circuited (for later recursions)
  const fishPushIsValid = validateChain
    ? fishPushValidQ({direction, pushedFishMetaIndex, fishIndexes, puzzle})
    : true;

  // If the fish can't be pushed in the direction of the stream, return the fish indexes unchanged
  if (!fishPushIsValid) {
    return fishIndexes;
  }

  const pushedFishIndex = fishIndexes[pushedFishMetaIndex];

  const targetIndex = getNextIndex(pushedFishIndex, direction);

  const targetMetaIndex = fishIndexes.findIndex((i) => i === targetIndex);

  let newFishIndexes = [...fishIndexes];

  newFishIndexes[pushedFishMetaIndex] = targetIndex;

  // if there was a fish at the target index, that fish gets pushed too
  if (targetMetaIndex !== -1) {
    newFishIndexes = pushFish({
      direction,
      pushedFishMetaIndex: targetMetaIndex,
      fishIndexes: newFishIndexes,
      puzzle,
      validateChain: false,
    });
  }

  return newFishIndexes;
}
