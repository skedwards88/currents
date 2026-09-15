import {type Direction} from "../components/Board";
import {type Feature, numColumns} from "./gameInit";
import {getRelativePositionsForPath} from "./getRelativePositionsForPath";
import {getRelativeRotationsForPath} from "./getRelativeRotationsForPath";

export function getAnimationNameFromPath(path: number[]): string {
  return `move${path.join("-")}`;
}

export function getKeyframesForPath({
  path,
  squareWidth,
  puzzle,
  swipeDirection,
}: {
  path: number[];
  squareWidth: number;
  puzzle: (Feature | null)[];
  swipeDirection: Direction;
}): string {
  const positionSteps = getRelativePositionsForPath(
    path,
    squareWidth,
    numColumns,
  );

  const rotationSteps = getRelativeRotationsForPath({
    path,
    puzzle,
    swipeDirection,
  });

  const stepSize = 1 / (positionSteps.length - 1);

  const translationStrings = positionSteps.map(
    ({x, y}) => `translate(${x}px, ${y}px)`,
  );

  const rotationStrings = rotationSteps.map(
    (rotation) => `rotate(${rotation}deg)`,
  );

  const frames = path
    .map((indexInPuzzle, indexInPath) => {
      if (puzzle[indexInPuzzle] === "whirlpool") {
        const nextIndexInPuzzle = path[indexInPath + 1];
        const prevIndexInPuzzle = path[indexInPath - 1];
        // Entering whirlpool: Move to pool, then rotate and shrink
        if (
          puzzle[nextIndexInPuzzle] === "whirlpool" &&
          indexInPuzzle != nextIndexInPuzzle
        ) {
          return `
            ${(stepSize * indexInPath - stepSize * 0.25) * 100}% { transform: ${translationStrings[indexInPath]} ${rotationStrings[indexInPath - 1] ?? "rotate(0deg)"} scale(1);}
            ${(stepSize * indexInPath + stepSize * 0.25) * 100}% { transform: ${translationStrings[indexInPath]} rotate(180deg) scale(0);}`;
        }
        // Exiting whirlpool: Move while shrunk, then unshrink and rotate
        if (
          puzzle[prevIndexInPuzzle] === "whirlpool" &&
          indexInPuzzle != prevIndexInPuzzle
        ) {
          return `
            ${(stepSize * indexInPath - stepSize * 0.25) * 100}% { transform: ${translationStrings[indexInPath]} rotate(180deg) scale(0);}
            ${stepSize * indexInPath * 100}% { transform: ${translationStrings[indexInPath]} rotate(-180deg) scale(1); }`;
        }
      }
      return `${stepSize * indexInPath * 100}% { transform: ${translationStrings[indexInPath]} ${rotationStrings[indexInPath]}; }`;
    })
    .join("\n");

  return `\n@keyframes ${getAnimationNameFromPath(path)} {\n${frames}\n}`;
}
