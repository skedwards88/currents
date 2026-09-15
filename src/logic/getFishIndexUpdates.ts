import {arraysMatchQ} from "@skedwards88/word_logic";
import {type Direction} from "../components/Board";
import {type GameState} from "./gameInit";
import {getFishIndexesAfterSwipe} from "./getFishIndexesAfterSwipe";
import {getFishIndexesAfterElementStep} from "./getFishIndexesAfterElementStep";

export function getFishIndexUpdates({
  startingFishIndexes,
  puzzle,
  direction,
}: {
  startingFishIndexes: GameState["fishHistory"][0];
  puzzle: GameState["puzzle"];
  direction: Direction;
}): number[][] {
  const fishIndexSteps: number[][] = [[...startingFishIndexes]];

  // Move the fish based on the swipe
  const fishIndexesAfterSwipe = getFishIndexesAfterSwipe({
    startingFishIndexes,
    puzzle,
    direction,
  });

  fishIndexSteps.push(fishIndexesAfterSwipe);

  // Move the fish due to interaction with elements (whirlpools, streams)
  // Get a snapshot of each step for animation purposes
  let fishIndexesAfterMovementStep = [...fishIndexesAfterSwipe];
  let whirlpoolHasBeenUsed = false;
  let elementInteractionIsComplete = false;

  while (!elementInteractionIsComplete) {
    const previousFishIndexesAfterMovementStep = [
      ...fishIndexesAfterMovementStep,
    ];

    [fishIndexesAfterMovementStep, whirlpoolHasBeenUsed] =
      getFishIndexesAfterElementStep({
        startingFishIndexes: fishIndexesAfterMovementStep,
        puzzle,
        whirlpoolHasBeenUsed,
      });

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
