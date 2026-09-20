import {arraysMatchQ, transposeGrid} from "@skedwards88/word_logic";
import React from "react";
import type {Feature} from "../logic/gameInit";
import {numColumns, numRows, type GameState} from "../logic/gameInit";
import {type ReducerPayload} from "../logic/gameReducer";
import {
  getAnimationNameFromPath,
  getKeyframesForPath,
} from "../logic/getKeyframesForPath";
import {getFinalDirectionForPath} from "../logic/getFinalDirectionForPath";
import {getFishIndexUpdates} from "../logic/getFishIndexUpdates";
import {levelCompleteQ} from "../logic/levelCompleteQ";

function handleSwipe({
  direction,
  fishIndexes,
  puzzle,
  setAnimationPaths,
  dispatchGameState,
}: {
  direction: Direction;
  fishIndexes: number[];
  puzzle: (Feature | null)[];
  dispatchGameState: React.Dispatch<ReducerPayload>;
  setAnimationPaths: React.Dispatch<React.SetStateAction<number[][] | null>>;
}): void {
  const animationSteps = getFishIndexUpdates({
    startingFishIndexes: fishIndexes,
    puzzle,
    direction,
  });

  const newIndexes = animationSteps[animationSteps.length - 1];

  // Don't bother moving (or deducting a swipe) if no movement is applicable
  if (animationSteps.length === 1 && arraysMatchQ(newIndexes, fishIndexes)) {
    return;
  }

  // The animation steps are index matched
  // Transpose to get the path per fish
  setAnimationPaths(transposeGrid(animationSteps));

  dispatchGameState({action: "move", newIndexes});
}

export const allDirections = ["up", "down", "left", "right"] as const;
export type Direction = (typeof allDirections)[number];

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
  fishHistory,
  maxSwipes,
  dispatchGameState,
}: {
  puzzle: GameState["puzzle"];
  maxSwipes: GameState["maxSwipes"];
  fishHistory: GameState["fishHistory"];
  dispatchGameState: React.Dispatch<ReducerPayload>;
}): React.JSX.Element {
  const fishIndexes = fishHistory[fishHistory.length - 1];

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

  // To distinguish between the mouse clicking and moving vs just moving
  const pointerIsDown = React.useRef(false);

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

  const onAnimationPathChange = React.useEffectEvent(
    (animationPaths: number[][]) => {
      if (!boardRef.current || !styleRef.current) {
        return;
      }

      const boardRect = boardRef.current.getBoundingClientRect();
      const boardWidth = boardRect.width;
      const squareWidth = boardWidth / numColumns;

      const animations = animationPaths
        ?.map((path) =>
          getKeyframesForPath({path, squareWidth, puzzle, swipeDirection}),
        )
        .join("\n");

      styleRef.current.textContent = animations;

      animationPaths.forEach((path) => {
        const finalSquareElement = squareRefs.current.get(
          path[path.length - 1],
        );

        if (!finalSquareElement) {
          return;
        }

        const animationName = getAnimationNameFromPath(path);

        finalSquareElement.style.animation = `${animationName} ${path.length * 500}ms linear forwards`;

        finalSquareElement.style.willChange = "transform";

        const onEnd = (): void => {
          finalSquareElement.style.animation = "";
          finalSquareElement.style.willChange = "";
          finalSquareElement.removeEventListener("animationend", onEnd);
        };

        finalSquareElement.addEventListener("animationend", onEnd);
      });
    },
  );

  React.useLayoutEffect(() => {
    if (!animationPaths?.length) {
      return;
    }

    onAnimationPathChange(animationPaths);
  }, [animationPaths]);

  const handleKeyDown = React.useCallback(
    (event: KeyboardEvent) => {
      if (
        (event.key === "Backspace" || event.key === "Delete") &&
        fishHistory.length > 1
      ) {
        dispatchGameState({action: "undo"});
        return;
      }

      if (
        (event.key === "Enter" || event.key === "ArrowRight") &&
        levelCompleteQ(fishIndexes, puzzle)
      ) {
        dispatchGameState({action: "nextLevel"});
        return;
      }

      const remainingSwipes = maxSwipes - (fishHistory.length - 1);

      if (remainingSwipes <= 0) {
        return;
      }

      let keyDirection: Direction;
      switch (event.key) {
        case "ArrowUp":
          keyDirection = "up";
          break;
        case "ArrowDown":
          keyDirection = "down";
          break;
        case "ArrowLeft":
          keyDirection = "left";
          break;
        case "ArrowRight":
          keyDirection = "right";
          break;
        default:
          return;
      }

      setSwipeDirection(keyDirection);

      handleSwipe({
        direction: keyDirection,
        fishIndexes,
        puzzle,
        setAnimationPaths,
        dispatchGameState,
      });
    },
    [fishIndexes, fishHistory, dispatchGameState, maxSwipes, puzzle],
  );

  // Keydown events need to be attached to the window, not the specific board element
  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return (): void => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

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

        pointerIsDown.current = true;

        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!pointerIsDown.current) {
          return;
        }

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
        pointerIsDown.current = false;

        event.currentTarget.releasePointerCapture(event.pointerId);

        const remainingSwipes = maxSwipes - (fishHistory.length - 1);

        if (isSwiping && swipeDirection && remainingSwipes > 0) {
          handleSwipe({
            direction: swipeDirection,
            fishIndexes,
            puzzle,
            setAnimationPaths,
            dispatchGameState,
          });
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
