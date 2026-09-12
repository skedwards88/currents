import React from "react";
import {type GameState} from "../logic/gameInit";
import {type ReducerPayload} from "../logic/gameReducer";
import {type DisplayState} from "./App";
import ControlBar from "./ControlBar";
import {levelCompleteQ} from "../logic/levelCompleteQ";
import {puzzles} from "../logic/puzzles";
import Board from "./Board";
import GameOver from "./GameOver";

function RemainingSwipes({
  remainingSwipes,
}: {
  remainingSwipes: number;
}): React.JSX.Element {
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
  remainingSwipes,
  fishHistory,
  puzzle,
  level,
}: {
  remainingSwipes: number;
  fishHistory: GameState["fishHistory"];
  puzzle: GameState["puzzle"];
  dispatchGameState: React.Dispatch<ReducerPayload>;
  setDisplay: React.Dispatch<React.SetStateAction<DisplayState>>;
  level: GameState["level"];
}): React.JSX.Element {
  const fishIndexes = fishHistory[fishHistory.length - 1];

  const levelComplete = levelCompleteQ(fishIndexes, puzzle);

  const gameComplete = levelComplete && level === puzzles.length;

  return gameComplete ? (
    <GameOver dispatchGameState={dispatchGameState}></GameOver>
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
        {levelComplete ? (
          <button
            id="nextLevelButton"
            onClick={() => dispatchGameState({action: "nextLevel"})}
          >
            Next level
          </button>
        ) : (
          <RemainingSwipes remainingSwipes={remainingSwipes} />
        )}
      </div>

      <Board
        fishIndexes={fishIndexes}
        puzzle={puzzle}
        dispatchGameState={dispatchGameState}
        remainingSwipes={remainingSwipes}
      ></Board>
    </div>
  );
}
