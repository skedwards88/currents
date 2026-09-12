import {arraysMatchQ, transposeGrid} from "@skedwards88/word_logic";
import React from "react";
import type {Feature} from "../logic/gameInit";
import {numColumns, numRows, type GameState} from "../logic/gameInit";
import {getFishIndexUpdates, type ReducerPayload} from "../logic/gameReducer";

export type Direction = "up" | "down" | "left" | "right";

function getXYForIndex(
  index: number,
  boardX: number,
  boardY: number,
  squareWidth: number,
): {x: number; y: number} {
  const colIndex = index % numColumns;
  const rowIndex = Math.floor(index / numColumns);

  const indexX = boardX + squareWidth * colIndex;
  const indexY = boardY + squareWidth * rowIndex;

  return {x: indexX, y: indexY};
}

function getAnimationNameFromPath(path: number[]): string {
  return `move${path.join("-")}`;
}

function getKeyframesForPath(
  path: number[],
  boardX: number,
  boardY: number,
  squareWidth: number,
): string {
  const finalIndex = path[path.length - 1];

  const finalPosition = getXYForIndex(finalIndex, boardX, boardY, squareWidth);

  const positionSteps = path.map((index) => {
    const position = getXYForIndex(index, boardX, boardY, squareWidth);
    return {x: position.x - finalPosition.x, y: position.y - finalPosition.y};
  });

  const frames = positionSteps
    .map(
      ({x, y}, index) =>
        `${(index / (positionSteps.length - 1)) * 100}% { transform: translate(${x}px, ${y}px); }`,
    )
    .join("\n");

  return `\n@keyframes ${getAnimationNameFromPath(path)} {\n${frames}\n}`;
}
function Square({
  feature,
  containsFish,
  swipeDirection,
  ref,
}: {
  feature: Feature | null;
  containsFish: boolean;
  swipeDirection: Direction;
  ref: React.Ref<HTMLDivElement>;
}): React.JSX.Element {
  const className = `square ${swipeDirection} ${feature ?? ""} ${containsFish ? "fish" : ""}`;

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
  const isSwiping = React.useRef(false);

  const [swipeDirection, setSwipeDirection] =
    React.useState<Direction>("right");

  const [animationPaths, setAnimationPaths] = React.useState<number[][] | null>(
    null,
  );

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
      ?.map((path) => getKeyframesForPath(path, boardX, boardY, squareWidth))
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
  }, [animationPaths]);

  const squares = puzzle.map((feature, index) => (
    <Square
      feature={feature}
      containsFish={fishIndexes.includes(index)}
      swipeDirection={swipeDirection}
      key={index}
      ref={squareRefCallbacks[index]}
    ></Square>
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

        isSwiping.current = true;

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

        if (isSwiping.current && remainingSwipes > 0) {
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

        isSwiping.current = false;
      }}
    >
      {/* for the generated animation keyframes */}
      <style ref={styleRef} />
      {squares}
    </div>
  );
}
