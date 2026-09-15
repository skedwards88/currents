import {type Direction} from "../components/Board";
import {numColumns, type Feature} from "./gameInit";
import {getDirectionBetweenIndexes} from "./getDirectionBetweenIndexes";
import {getFinalDirectionForPath} from "./getFinalDirectionForPath";

// To keep from rotating the "long way" around
function getShortestRotationDelta(rotation: number): number {
  return ((((rotation + 180) % 360) + 360) % 360) - 180;
}

// The fish icon points "right" unless rotated
function convertDirectionToRotation(direction: Direction): number {
  switch (direction) {
    case "up":
      return 270;
    case "down":
      return 90;
    case "right":
      return 0;
    case "left":
      return 180;

    default: {
      // Fails if any direction is not covered by the cases above
      const exhaustiveCheck: never = direction;

      throw new Error(`no opposing stream for ${String(exhaustiveCheck)}`);
    }
  }
}

function getRotationForIndex({
  index,
  puzzle,
  previousIndex,
}: {
  index: number;
  puzzle: (Feature | null)[];
  previousIndex?: number;
}): number | null {
  if (puzzle[index] === "streamDown") {
    return convertDirectionToRotation("down");
  } else if (puzzle[index] === "streamUp") {
    return convertDirectionToRotation("up");
  } else if (puzzle[index] === "streamLeft") {
    return convertDirectionToRotation("left");
  } else if (puzzle[index] === "streamRight") {
    return convertDirectionToRotation("right");
  } else if (puzzle[index] === "whirlpool") {
    return 360; // The whirlpool rotation is hardcoded in the keyframes, but net is 360
  } else if (previousIndex != undefined) {
    const direction = getDirectionBetweenIndexes(
      previousIndex,
      index,
      numColumns,
    );
    if (direction === null) {
      return null;
    }
    return convertDirectionToRotation(direction);
  } else {
    return null;
  }
}

export function getRelativeRotationsForPath({
  path,
  puzzle,
  swipeDirection,
}: {
  path: number[];
  puzzle: (Feature | null)[];
  swipeDirection: Direction;
}): number[] {
  const finalDirection =
    getFinalDirectionForPath(path, puzzle) ?? swipeDirection;

  const finalRotation = getShortestRotationDelta(
    convertDirectionToRotation(finalDirection),
  );

  // Rotation for the first index is the swipe direction, relative to the final direction
  const rotations = [
    getShortestRotationDelta(
      convertDirectionToRotation(swipeDirection) - finalRotation,
    ),
  ];

  for (let metaIndex = 1; metaIndex < path.length - 1; metaIndex++) {
    const indexInPuzzle = path[metaIndex];

    const previousRotation = rotations[metaIndex - 1];

    const rawRotation =
      getRotationForIndex({
        index: indexInPuzzle,
        puzzle,
        previousIndex: path[metaIndex - 1],
      }) ?? previousRotation + finalRotation;

    const rawRelativeRotation = rawRotation - finalRotation;

    const delta = getShortestRotationDelta(
      rawRelativeRotation - previousRotation,
    );
    rotations.push(previousRotation + delta);
  }

  // Last rotation is always an equivalent of 0
  const previousRotation = rotations[rotations.length - 1];
  const delta = getShortestRotationDelta(0 - previousRotation);
  rotations.push(previousRotation + delta);

  return rotations;
}
