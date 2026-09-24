import React from "react";
import {type GameState} from "../logic/gameInit";
import {type ReducerPayload} from "../logic/gameReducer";
import {type DisplayState} from "./App";
import ControlBar from "./ControlBar";
import {levelCompleteQ} from "../logic/levelCompleteQ";
import {firstBonusLevel, puzzles} from "../logic/puzzles";
import Board, {type Direction, handleHint} from "./Board";
import GameOver from "./GameOver";

function RemainingSwipes({
  maxSwipes,
  fishHistory,
}: {
  maxSwipes: GameState["maxSwipes"];
  fishHistory: GameState["fishHistory"];
}): React.JSX.Element {
  const remainingSwipes = maxSwipes - (fishHistory.length - 1);

  const className =
    remainingSwipes === 0
      ? "errorText"
      : remainingSwipes === 1
        ? "warningText"
        : "";

  return (
    <p
      className={className}
    >{`${remainingSwipes} swipe${remainingSwipes === 1 ? "" : "s"}`}</p>
  );
}

export default function Game({
  dispatchGameState,
  setDisplay,
  maxSwipes,
  fishHistory,
  puzzle,
  level,
}: {
  maxSwipes: GameState["maxSwipes"];
  fishHistory: GameState["fishHistory"];
  puzzle: GameState["puzzle"];
  dispatchGameState: React.Dispatch<ReducerPayload>;
  setDisplay: React.Dispatch<React.SetStateAction<DisplayState>>;
  level: GameState["level"];
}): React.JSX.Element {
  // Swipe direction and animation paths live here instead of board so that the hint button can access them as well
  const [swipeDirection, setSwipeDirection] =
    React.useState<Direction>("right");

  const [animationPaths, setAnimationPaths] = React.useState<number[][] | null>(
    null,
  );

  const fishIndexes = fishHistory[fishHistory.length - 1];

  const levelComplete = levelCompleteQ(fishIndexes, puzzle);

  const basicLevelsComplete = levelComplete && level >= firstBonusLevel - 1;
  const bonusLevelsComplete = levelComplete && level === puzzles.length;
  const isOnBonusLevel = level >= firstBonusLevel;

  const [resetKey, setResetKey] = React.useState(1);

  const [delayElapsed, setDelayElapsed] = React.useState(false);

  let showGameOver = false;
  if (basicLevelsComplete && !isOnBonusLevel) {
    showGameOver = true;
  }
  if (bonusLevelsComplete && isOnBonusLevel) {
    showGameOver = true;
  }

  // Delay before showing the game over screen so it isn't so abrupt
  React.useEffect(() => {
    if (!basicLevelsComplete) return;
    if (isOnBonusLevel && !bonusLevelsComplete) return;

    const timer = setTimeout(() => setDelayElapsed(true), 500);
    return (): void => {
      clearTimeout(timer);

      setDelayElapsed(false);
    };
  }, [basicLevelsComplete, bonusLevelsComplete, isOnBonusLevel]);

  let progress = 0;
  if (!isOnBonusLevel) {
    progress = basicLevelsComplete
      ? 100
      : ((level - 1) / (firstBonusLevel - 1)) * 100;
  } else {
    progress = bonusLevelsComplete
      ? 100
      : ((level - firstBonusLevel) / (puzzles.length - firstBonusLevel + 1)) *
        100;
  }

  return showGameOver && delayElapsed ? (
    <GameOver
      dispatchGameState={dispatchGameState}
      bonusLevelsComplete={bonusLevelsComplete}
    ></GameOver>
  ) : (
    <div id="game" className="App">
      <ControlBar setDisplay={setDisplay}></ControlBar>

      <div id="playControls">
        <button
          id="resetButton"
          className="playControlButton"
          disabled={fishHistory.length === 1}
          onClick={() => {
            dispatchGameState({action: "reset"});
            setResetKey((previous) => previous + 1);
          }}
        ></button>
        <button
          id="undoButton"
          className="playControlButton"
          disabled={fishHistory.length === 1}
          onClick={() => {
            dispatchGameState({action: "undo"});
          }}
        ></button>
        <button
          id="hintButton"
          className="playControlButton"
          disabled={levelComplete}
          onClick={() => {
            handleHint({
              fishHistory,
              puzzle,
              maxSwipes,
              setSwipeDirection,
              setAnimationPaths,
              dispatchGameState,
            });
          }}
        ></button>
        {levelComplete && !showGameOver ? (
          <button
            id="nextLevelButton"
            onClick={() => dispatchGameState({action: "nextLevel"})}
          >
            Next level
          </button>
        ) : (
          <RemainingSwipes maxSwipes={maxSwipes} fishHistory={fishHistory} />
        )}
      </div>

      <div id="progressBar">
        <div
          id="progress"
          style={{
            width: `${Math.min(progress, 100)}%`,
          }}
        >
          <div id="progressFish"></div>
        </div>
        <div id="progressCoral"></div>
      </div>

      <Board
        fishHistory={fishHistory}
        puzzle={puzzle}
        dispatchGameState={dispatchGameState}
        maxSwipes={maxSwipes}
        swipeDirection={swipeDirection}
        setSwipeDirection={setSwipeDirection}
        animationPaths={animationPaths}
        setAnimationPaths={setAnimationPaths}
        // Force the child to remount on refresh
        key={resetKey}
      ></Board>
    </div>
  );
}
