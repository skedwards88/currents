import {type Direction} from "../components/Game";
import {type Feature, type GameState} from "./gameInit";
import {getNextIndex} from "./getNextIndex";

function getOpposingStream(
  direction: Direction,
): "streamUp" | "streamDown" | "streamLeft" | "streamRight" {
  switch (direction) {
    case "up":
      return "streamDown";
    case "down":
      return "streamUp";
    case "right":
      return "streamLeft";
    case "left":
      return "streamRight";

    default: {
      // Fails if any direction is not covered by the cases above
      const exhaustiveCheck: never = direction;

      throw new Error(`no opposing stream for ${String(exhaustiveCheck)}`);
    }
  }
}

function applyMovement(
  initialPuzzle: Feature[][],
  direction: Direction,
): Feature[][] {
  const puzzleWithoutFish = initialPuzzle.map((features) =>
    features.filter((feature) => feature != "fish"),
  );

  const startingFishIndexes = initialPuzzle.reduce<number[]>(
    (accumulated, currentFeatures, currentIndex) => {
      if (currentFeatures.includes("fish")) {
        accumulated.push(currentIndex);
      }
      return accumulated;
    },
    [],
  );

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
          puzzleWithoutFish[targetIndex].includes("rock") ||
          puzzleWithoutFish[targetIndex].includes(opposingStream) ||
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

  return puzzleWithoutFish.map((features, index) =>
    fishIndexesAfterMovement.includes(index) ? [...features, "fish"] : features,
  );
}

export type ReducerPayload =
  | {
      action: "reset";
    }
  | {action: "undo"}
  | {action: "move"; direction: Direction};

export function gameReducer(
  currentGameState: GameState,
  payload: ReducerPayload,
): GameState {
  if (payload.action === "reset") {
    return {
      ...currentGameState,
      remainingSweeps:
        currentGameState.remainingSweeps +
        (currentGameState.puzzleHistory.length - 1),
      puzzleHistory: currentGameState.puzzleHistory.slice(0, 1),
    };
  }
  if (payload.action === "undo") {
    return {
      ...currentGameState,
      remainingSweeps: currentGameState.remainingSweeps + 1,
      puzzleHistory: currentGameState.puzzleHistory.slice(
        0,
        Math.max(currentGameState.puzzleHistory.length - 1),
      ),
    };
  }
  if (payload.action === "move") {
    if (currentGameState.remainingSweeps === 0) {
      return currentGameState;
    }

    const updatedPuzzle = applyMovement(
      currentGameState.puzzleHistory[currentGameState.puzzleHistory.length - 1],
      payload.direction,
    );

    // todo if nothing moved don't count it as a sweep; just return original state

    return {
      ...currentGameState,
      remainingSweeps: currentGameState.remainingSweeps - 1,
      puzzleHistory: [...currentGameState.puzzleHistory, updatedPuzzle],
    };
  } else {
    console.log(
      `unknown action: ${(payload as unknown as {action: string}).action}`,
    );
    return currentGameState;
  }
}
