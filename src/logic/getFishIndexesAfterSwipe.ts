import {type Direction} from "../components/Board";
import {type Feature, type GameState} from "./gameInit";
import {getNextIndex} from "./getNextIndex";
import {getOpposingStream} from "./getOpposingStream";

export function getFishIndexesAfterSwipe({
  startingFishIndexes,
  puzzle,
  direction,
}: {
  startingFishIndexes: GameState["fishHistory"][0];
  puzzle: GameState["puzzle"];
  direction: Direction;
}): GameState["fishHistory"][0] {
  // figure out the index where the fish should move if unblocked
  const targetFishIndexes = startingFishIndexes.map((startingIndex) =>
    getNextIndex(startingIndex, direction),
  );

  const opposingStream: Feature = getOpposingStream(direction);

  const canMoveFish: (boolean | null)[] = Array.from(
    {length: startingFishIndexes.length},
    () => null,
  );

  while (canMoveFish.includes(null)) {
    for (
      let metaIndex = 0;
      metaIndex < startingFishIndexes.length;
      metaIndex++
    ) {
      if (canMoveFish[metaIndex] === null) {
        const targetIndex = targetFishIndexes[metaIndex];
        // A fish can't move if it is blocked by a rock, opposing stream, or the edge (which is indicated by the target index being the same as the starting index)
        if (
          puzzle[targetIndex] === "rock" ||
          puzzle[targetIndex] === opposingStream ||
          targetIndex === startingFishIndexes[metaIndex]
        ) {
          canMoveFish[metaIndex] = false;
          continue;
        }

        const targetMetaIndex = startingFishIndexes.indexOf(targetIndex);

        // no fish at target location, so can move
        if (targetMetaIndex === -1) {
          canMoveFish[metaIndex] = true;
          continue;
        }

        const canMoveFishAtTarget = canMoveFish[targetMetaIndex];

        // If there is another fish at the target location and the other fish can't move, neither can this fish
        if (canMoveFishAtTarget === false) {
          canMoveFish[metaIndex] = false;
          continue;
        }

        // If there is another fish at the target location but we don't know whether the other fish can move yet, skip for this iteration
        if (canMoveFishAtTarget === null) {
          continue;
        }

        canMoveFish[metaIndex] = true;
      }
    }
  }

  const fishIndexesAfterMovement = canMoveFish.map((canMove, metaIndex) =>
    canMove ? targetFishIndexes[metaIndex] : startingFishIndexes[metaIndex],
  );

  return fishIndexesAfterMovement;
}
