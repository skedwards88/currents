import {arraysMatchQ, transposeGrid} from "@skedwards88/word_logic";
import React from "react";
import type {Feature} from "../logic/gameInit";
import {numColumns, numRows, type GameState} from "../logic/gameInit";
import {getFishIndexUpdates, type ReducerPayload} from "../logic/gameReducer";

export type Direction = "up" | "down" | "left" | "right";

function indexToColumn(index: number): number {
  return index % numColumns;
}

function indexToRow(index: number): number {
  return Math.floor(index / numColumns);
}

function getXYForIndex(
  index: number,
  boardX: number,
  boardY: number,
  squareWidth: number,
): {x: number; y: number} {
  const colIndex = indexToColumn(index);
  const rowIndex = indexToRow(index);

  const indexX = boardX + squareWidth * colIndex;
  const indexY = boardY + squareWidth * rowIndex;

  return {x: indexX, y: indexY};
}

function getAnimationNameFromPath(path: number[]): string {
  return `move${path.join("-")}`;
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

function getDirectionBetweenIndexes(
  fromIndex: number,
  toIndex: number,
): Direction | null {
  if (fromIndex === toIndex) {
    return null;
  }

  const fromColumn = indexToColumn(fromIndex);
  const toColumn = indexToColumn(toIndex);
  const fromRow = indexToRow(fromIndex);
  const toRow = indexToRow(toIndex);

  // If both the column and row changed, or either change was > 1, then a whirlpool was involved
  // (A whirlpool could still be involved otherwise, but would be an adjacent whirlpool and will just be treated as a normal adjacent move)
  if (
    (fromColumn != toColumn && fromRow != toRow) ||
    Math.abs(fromColumn - toColumn) > 1 ||
    Math.abs(fromRow - toRow) > 1
  ) {
    return null;
  }

  if (fromColumn < toColumn) {
    return "right";
  }

  if (fromColumn > toColumn) {
    return "left";
  }

  if (fromRow < toRow) {
    return "down";
  }

  if (fromRow > toRow) {
    return "up";
  }

  // this should never be reached
  return null;
}

function getRotationForIndex(
  index: number,
  puzzle: (Feature | null)[],
  previousIndex?: number,
): number | null {
  if (puzzle[index] === "streamDown") {
    return convertDirectionToRotation("down");
  } else if (puzzle[index] === "streamUp") {
    return convertDirectionToRotation("up");
  } else if (puzzle[index] === "streamLeft") {
    return convertDirectionToRotation("left");
  } else if (puzzle[index] === "streamRight") {
    return convertDirectionToRotation("right");
  } else if (puzzle[index] === "whirlpool") {
    return 720;
  } else if (previousIndex != undefined) {
    const direction = getDirectionBetweenIndexes(previousIndex, index);
    if (direction === null) {
      return null;
    }
    return convertDirectionToRotation(direction);
  } else {
    return null;
  }
}

function getFinalDirectionForPath(
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
    );

    if (movementDirection != null) {
      return movementDirection;
    }
  }

  return null;
}

// To keep from rotating the "long way" around
function getShortestRotationDelta(rotation: number): number {
  return ((((rotation + 180) % 360) + 360) % 360) - 180;
}

function getRelativeRotationsForPath(
  path: number[],
  puzzle: (Feature | null)[],
  swipeDirection: Direction,
): number[] {
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
      getRotationForIndex(indexInPuzzle, puzzle, path[metaIndex - 1]) ??
      previousRotation + finalRotation;

    const rawRelativeRotation = rawRotation - finalRotation;

    // Let the whirlpool spin
    if (puzzle[indexInPuzzle] === "whirlpool") {
      rotations.push(rawRelativeRotation);
    } else {
      const delta = getShortestRotationDelta(
        rawRelativeRotation - previousRotation,
      );
      rotations.push(previousRotation + delta);
    }
  }

  // Last rotation is always an equivalent of 0
  const previousRotation = rotations[rotations.length - 1];
  const delta = getShortestRotationDelta(0 - previousRotation);
  rotations.push(previousRotation + delta);

  return rotations;
}

function getRelativePositionsForPath(
  path: number[],
  boardX: number,
  boardY: number,
  squareWidth: number,
): {x: number; y: number}[] {
  const finalIndex = path[path.length - 1];

  const finalPosition = getXYForIndex(finalIndex, boardX, boardY, squareWidth);

  return path.map((index) => {
    const position = getXYForIndex(index, boardX, boardY, squareWidth);
    return {x: position.x - finalPosition.x, y: position.y - finalPosition.y};
  });
}

function getKeyframesForPath(
  path: number[],
  boardX: number,
  boardY: number,
  squareWidth: number,
  puzzle: (Feature | null)[],
  swipeDirection: Direction,
): string {
  const positionSteps = getRelativePositionsForPath(
    path,
    boardX,
    boardY,
    squareWidth,
  );

  const rotationSteps = getRelativeRotationsForPath(
    path,
    puzzle,
    swipeDirection,
  );

  const stepSize = 1 / (positionSteps.length - 1);

  const translationStrings = positionSteps.map(
    ({x, y}) => `translate(${x}px, ${y}px)`,
  );

  const rotationStrings = rotationSteps.map(
    (rotation) => `rotate(${rotation}deg)`,
  );

  const frames = positionSteps
    .map((_, index) => {
      if (index === 0 || index === positionSteps.length - 1) {
        return `${stepSize * index * 100}% { transform: ${translationStrings[index]} ${rotationStrings[index]}; }`;
      }

      return `${stepSize * index * 100}% { transform: ${translationStrings[index]} ${rotationStrings[index - 1]}; }\n${stepSize * (index + 0.5) * 100}% { transform: ${translationStrings[index]} ${rotationStrings[index]}; }`;
    })
    .join("\n");

  return `\n@keyframes ${getAnimationNameFromPath(path)} {\n${frames}\n}`;
}

function FeatureSquare({
  feature,
}: {
  feature: Feature | null;
}): React.JSX.Element {
  const className = `square ${feature ?? ""}`;

  return <div className={className}></div>;
}

function FishSquare({
  containsFish,
  direction,
  ref,
}: {
  containsFish: boolean;
  direction: Direction | undefined;
  ref: React.Ref<HTMLDivElement>;
}): React.JSX.Element {
  const className = `square ${direction ?? ""} ${containsFish ? "fish" : ""}`;

  return <div className={className} ref={ref}></div>;
}

export default function Board({
  puzzle,
  fishIndexes,
  remainingSwipes,
  dispatchGameState,
}: {
  puzzle: GameState["puzzle"];
  remainingSwipes: GameState["remainingSwipes"];
  fishIndexes: GameState["fishHistory"][0];
  dispatchGameState: React.Dispatch<ReducerPayload>;
}): React.JSX.Element {
  const boardRef = React.useRef<HTMLDivElement>(null);
  const styleRef = React.useRef<HTMLStyleElement>(null);
  const squareRefs = React.useRef<Map<number, HTMLDivElement>>(new Map());
  const squareRefCallbacks = React.useMemo(
    () =>
      Array.from(
        {length: numColumns * numRows},
        (_, index) =>
          (node: HTMLDivElement | null): void => {
            if (node) {
              squareRefs.current.set(index, node);
            } else {
              squareRefs.current.delete(index);
            }
          },
      ),
    [],
  );

  const swipeOrigin = React.useRef({x: 0, y: 0});

  const [isSwiping, setIsSwiping] = React.useState(false);

  const [swipeDirection, setSwipeDirection] =
    React.useState<Direction>("right");

  const [animationPaths, setAnimationPaths] = React.useState<number[][] | null>(
    null,
  );

  const finalDirectionByIndex: Map<number, Direction> = new Map();
  animationPaths?.forEach((path) => {
    const finalIndex = path[path.length - 1];
    const finalDirection =
      getFinalDirectionForPath(path, puzzle) ?? swipeDirection;
    finalDirectionByIndex.set(finalIndex, finalDirection);
  });

  React.useLayoutEffect(() => {
    if (!boardRef.current || !styleRef.current || !animationPaths?.length) {
      return;
    }

    const boardRect = boardRef.current.getBoundingClientRect();
    const boardX = boardRect.x;
    const boardY = boardRect.y;
    const boardWidth = boardRect.width;
    const squareWidth = boardWidth / numColumns;

    const animations = animationPaths
      ?.map((path) =>
        getKeyframesForPath(
          path,
          boardX,
          boardY,
          squareWidth,
          puzzle,
          swipeDirection,
        ),
      )
      .join("\n");

    styleRef.current.textContent = animations;

    animationPaths.forEach((path) => {
      const finalSquareElement = squareRefs.current.get(path[path.length - 1]);

      if (!finalSquareElement) {
        return;
      }

      const animationName = getAnimationNameFromPath(path);

      finalSquareElement.style.animation = `${animationName} ${path.length * 1000}ms linear forwards`;

      finalSquareElement.style.willChange = "transform";

      const onEnd = (): void => {
        finalSquareElement.style.animation = "";
        finalSquareElement.style.willChange = "";
        finalSquareElement.removeEventListener("animationend", onEnd);
      };

      finalSquareElement.addEventListener("animationend", onEnd);
    });
  }, [animationPaths, puzzle, swipeDirection]);

  const fishSquares = puzzle.map((_, index) => (
    <FishSquare
      containsFish={fishIndexes.includes(index)}
      direction={isSwiping ? swipeDirection : finalDirectionByIndex.get(index)}
      key={index}
      ref={squareRefCallbacks[index]}
    ></FishSquare>
  ));

  const featureSquares = puzzle.map((feature, index) => (
    <FeatureSquare feature={feature} key={index}></FeatureSquare>
  ));

  return (
    <div
      id="board"
      ref={boardRef}
      onPointerDown={(event) => {
        swipeOrigin.current = {x: event.screenX, y: event.screenY};

        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const dx = event.screenX - swipeOrigin.current.x;
        const dy = event.screenY - swipeOrigin.current.y;

        const threshold =
          event.currentTarget.getBoundingClientRect().width / 10;

        if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) {
          return;
        }

        setIsSwiping(true);

        let nextDirection: Direction;
        if (Math.abs(dx) > Math.abs(dy)) {
          nextDirection = dx > 0 ? "right" : "left";
        } else {
          nextDirection = dy > 0 ? "down" : "up";
        }

        setSwipeDirection(nextDirection);
      }}
      onPointerUp={(event) => {
        event.currentTarget.releasePointerCapture(event.pointerId);

        if (isSwiping && swipeDirection && remainingSwipes > 0) {
          const animationSteps = getFishIndexUpdates(
            fishIndexes,
            puzzle,
            swipeDirection,
          );

          const newIndexes = animationSteps[animationSteps.length - 1];

          // Don't bother moving (or deducting a swipe) if no movement is applicable
          if (
            animationSteps.length === 1 &&
            arraysMatchQ(newIndexes, fishIndexes)
          ) {
            return;
          }

          // The animation steps are index matched
          // Transpose to get the path per fish
          setAnimationPaths(transposeGrid(animationSteps));

          dispatchGameState({action: "move", newIndexes});
        }

        setIsSwiping(false);
      }}
    >
      {/* for the generated animation keyframes */}
      <style ref={styleRef} />
      <div id="fishSquares">{fishSquares}</div>
      <div id="featureSquares">{featureSquares}</div>
    </div>
  );
}
