import {arraysMatchQ} from "@skedwards88/word_logic";
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

function getFishIndexesAfterSweep(
  startingFishIndexes: number[],
  puzzle: (Feature | null)[],
  direction: Direction,
): number[] {
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
        // todo might be able to use fishPushValidQ? but I think not
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

function getFishIndexesAfterElementStep(
  startingFishIndexes: number[],
  puzzle: (Feature | null)[],
  whirlpoolHasBeenUsed: boolean,
): [number[], boolean] {
  // Gets a single animation step for element interaction
  // Rules:
  // - Process the fish in order 0..34
  // - A fish can push other fish as long as:
  //   - Each fish moves once or less
  //   - No fishes in the cascade of pushes can be pushed into a rock/opposing stream/off the edge or out of a stream/whirlpool
  // - Whirlpools can be used once per the entire animation (not once per animation step)

  // Always 0 or 2 whirlpools
  const whirlpoolIndexes = puzzle.reduce<number[]>(
    (accumulated, currentFeature, currentIndex) => {
      if (currentFeature === "whirlpool") {
        accumulated.push(currentIndex);
      }
      return accumulated;
    },
    [],
  );

  // Starts as a snapshot of the starting indexes but gets updated later
  let finalFishIndexes = [...startingFishIndexes];

  let movementIsComplete = false;

  while (!movementIsComplete) {
    const previousFinalFishIndexes = [...finalFishIndexes];

    outerLoop: for (
      let metaIndex = 0;
      metaIndex < startingFishIndexes.length;
      metaIndex++
    ) {
      const startingFishIndex = startingFishIndexes[metaIndex];

      // If the fish already moved (e.g. because it was pushed by an earlier fish), skip to next fish
      if (startingFishIndexes[metaIndex] != finalFishIndexes[metaIndex]) {
        continue;
      }

      const element = puzzle[startingFishIndex];

      // If there is no element to interact with, skip to next fish
      if (!element) {
        continue;
      }

      // If the element is a whirlpool:
      // If whirlpools have already been used, skip to next fish
      // If other end of the whirlpool has a fish, skip to next fish
      // Otherwise, move the fish to the other end of the whirlpool and mark the whirlpool as used, then skip to next fish
      if (element === "whirlpool") {
        if (whirlpoolHasBeenUsed) {
          continue;
        } else {
          const targetIndex = whirlpoolIndexes.find(
            (i) => i != startingFishIndex,
          )!; // ok to assert ! here since there is always a second whirlpool index

          if (finalFishIndexes.includes(targetIndex)) {
            continue;
          }

          finalFishIndexes[metaIndex] = targetIndex;

          whirlpoolHasBeenUsed = true;

          continue;
        }
      }

      let streamDirection: Direction | null = null;
      if (element === "streamDown") {
        streamDirection = "down";
      } else if (element === "streamUp") {
        streamDirection = "up";
      } else if (element === "streamLeft") {
        streamDirection = "left";
      } else if (element === "streamRight") {
        streamDirection = "right";
      }

      if (!streamDirection) {
        continue;
      }

      // Check if we can push the fish in the direction of the stream (including any cascading pushes)
      const fishPushIsValid = fishPushValidQ(
        startingFishIndex,
        streamDirection,
        finalFishIndexes,
        puzzle,
      );

      // If the fish can't be pushed in the direction of the stream, skip to the next fish
      // todo don't need this since push function checks it
      if (!fishPushIsValid) {
        continue;
      }

      const fishIndexesAfterPush = pushFish(
        startingFishIndex,
        streamDirection,
        finalFishIndexes,
        puzzle,
      );

      // If the pushed fish indexes move any fish that already moved, reject the push
      for (let index = 0; index < fishIndexesAfterPush.length; index++) {
        const fishAlreadyMoved =
          startingFishIndexes[index] != finalFishIndexes[index];
        const fishMovedDuringPush =
          fishIndexesAfterPush[index] != finalFishIndexes[index];
        if (fishAlreadyMoved && fishMovedDuringPush) {
          continue outerLoop;
        }
      }

      // Otherwise, apply the push
      finalFishIndexes = fishIndexesAfterPush;
    }
    if (arraysMatchQ(previousFinalFishIndexes, finalFishIndexes)) {
      movementIsComplete = true;
    }
  }

  return [finalFishIndexes, whirlpoolHasBeenUsed];
}

function fishPushValidQ(
  pushedFishIndex: number,
  direction: Direction,
  fishIndexes: number[],
  puzzle: (Feature | null)[],
): boolean {
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
    return fishPushValidQ(targetIndex, direction, fishIndexes, puzzle);
  }

  return true;
}

function pushFish(
  pushedFishIndex: number,
  direction: Direction,
  fishIndexes: number[],
  puzzle: (Feature | null)[],
): number[] {
  // Push a fish in a direction. If a fish is in the new location, push that fish as well
  // Doesn't push the fish if any fish in the chain of pushing can't be pushed

  // todo add something so this only gets called once instead of on every recursion
  const fishPushIsValid = fishPushValidQ(
    pushedFishIndex,
    direction,
    fishIndexes,
    puzzle,
  );

  // If the fish can't be pushed in the direction of the stream, return the fish indexes unchanged
  if (!fishPushIsValid) {
    return fishIndexes;
  }

  let newFishIndexes = [...fishIndexes];

  const targetIndex = getNextIndex(pushedFishIndex, direction);

  const pushedFishMetaIndex = fishIndexes.findIndex(
    (i) => i === pushedFishIndex,
  );

  if (pushedFishMetaIndex === -1) {
    throw new Error(
      `Pushed index ${pushedFishIndex} not in fish indexes ${String(fishIndexes)}`,
    );
  }

  newFishIndexes[pushedFishMetaIndex] = targetIndex;

  // if there was a fish at the target index, that fish gets pushed too
  if (fishIndexes.includes(targetIndex)) {
    newFishIndexes = pushFish(targetIndex, direction, newFishIndexes, puzzle);
  }

  return newFishIndexes;
}

function getFishIndexUpdates(
  startingFishIndexes: number[],
  puzzle: (Feature | null)[],
  direction: Direction,
): number[][] {
  const fishIndexSteps: number[][] = [];

  // Move the fish based on the swipe
  const fishIndexesAfterSweep = getFishIndexesAfterSweep(
    startingFishIndexes,
    puzzle,
    direction,
  );

  fishIndexSteps.push(fishIndexesAfterSweep);

  // Move the fish due to interaction with elements (whirlpools, streams)
  // Get a snapshot of each step for animation purposes
  let fishIndexesAfterMovementStep = [...fishIndexesAfterSweep];
  let whirlpoolHasBeenUsed = false;
  let elementInteractionIsComplete = false;

  while (!elementInteractionIsComplete) {
    const previousFishIndexesAfterMovementStep = [
      ...fishIndexesAfterMovementStep,
    ];

    [fishIndexesAfterMovementStep, whirlpoolHasBeenUsed] =
      getFishIndexesAfterElementStep(
        fishIndexesAfterMovementStep,
        puzzle,
        whirlpoolHasBeenUsed,
      );

    if (
      arraysMatchQ(
        fishIndexesAfterMovementStep,
        previousFishIndexesAfterMovementStep,
      )
    ) {
      elementInteractionIsComplete = true;
    } else {
      fishIndexSteps.push(fishIndexesAfterMovementStep);
    }
  }

  return fishIndexSteps;
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
        (currentGameState.fishHistory.length - 1),
      fishHistory: currentGameState.fishHistory.slice(0, 1),
    };
  }
  if (payload.action === "undo") {
    return {
      ...currentGameState,
      remainingSweeps: currentGameState.remainingSweeps + 1,
      fishHistory: currentGameState.fishHistory.slice(
        0,
        Math.max(currentGameState.fishHistory.length - 1),
      ),
    };
  }
  if (payload.action === "move") {
    if (currentGameState.remainingSweeps === 0) {
      return currentGameState;
    }

    const currentFishIndexes =
      currentGameState.fishHistory[currentGameState.fishHistory.length - 1];

    const updatedFishIndexes = getFishIndexUpdates(
      currentFishIndexes,
      currentGameState.puzzle,
      payload.direction,
    );

    // Don't reduce sweeps if no movement is applicable
    if (
      arraysMatchQ(
        updatedFishIndexes[updatedFishIndexes.length - 1],
        currentFishIndexes,
      )
    ) {
      return currentGameState;
    }

    return {
      ...currentGameState,
      remainingSweeps: currentGameState.remainingSweeps - 1,
      fishHistory: [
        ...currentGameState.fishHistory,
        updatedFishIndexes[updatedFishIndexes.length - 1],
      ],
    };
  } else {
    console.log(
      `unknown action: ${(payload as unknown as {action: string}).action}`,
    );
    return currentGameState;
  }
}
