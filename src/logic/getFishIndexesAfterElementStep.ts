import {arraysMatchQ} from "@skedwards88/word_logic";
import {type Direction} from "../components/Board";
import {type GameState} from "./gameInit";
import {pushFish} from "./pushFish";

export function getFishIndexesAfterElementStep({
  startingFishIndexes,
  puzzle,
  whirlpoolHasBeenUsed,
}: {
  startingFishIndexes: GameState["fishHistory"][0];
  puzzle: GameState["puzzle"];
  whirlpoolHasBeenUsed: boolean;
}): [GameState["fishHistory"][0], boolean] {
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

      const fishIndexesAfterPush = pushFish({
        direction: streamDirection,
        pushedFishMetaIndex: metaIndex,
        fishIndexes: finalFishIndexes,
        puzzle,
      });

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
