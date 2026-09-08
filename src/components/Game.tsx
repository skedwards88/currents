import React from "react";
import type {Feature} from "../logic/gameInit";
import {type GameState} from "../logic/gameInit";
import {type ReducerPayload} from "../logic/gameReducer";
import {type DisplayState} from "./App";
import ControlBar from "./ControlBar";
import {levelCompleteQ} from "../logic/levelCompleteQ";
import {puzzles} from "../logic/puzzles";
import GameOver from "./GameOver";

export type Direction = "up" | "down" | "left" | "right";
function Square({
  feature,
  containsFish,
  swipeDirection,
}: {
  feature: Feature | null;
  containsFish: boolean;
  swipeDirection: Direction;
}): React.JSX.Element {
  const className = `square ${swipeDirection} ${feature ?? ""} ${containsFish ? "fish" : ""}`;

  return <div className={className}></div>;
}

function Board({
  puzzle,
  fishIndexes,
  dispatchGameState,
}: {
  puzzle: GameState["puzzle"];
  fishIndexes: GameState["fishHistory"][0];
  dispatchGameState: React.Dispatch<ReducerPayload>;
}): React.JSX.Element {
  const swipeOrigin = React.useRef({x: 0, y: 0});

  const [swipeDirection, setSwipeDirection] =
    React.useState<Direction>("right");

  const squares = puzzle.map((feature, index) => (
    <Square
      feature={feature}
      containsFish={fishIndexes.includes(index)}
      swipeDirection={swipeDirection}
      key={index}
    ></Square>
  ));

  return (
    <div
      id="board"
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
        dispatchGameState({action: "move", direction: swipeDirection});
      }}
    >
      {squares}
    </div>
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
          <p>{`${remainingSwipes} swipe${remainingSwipes === 1 ? "" : "s"}`}</p>
        )}
      </div>

      <Board
        fishIndexes={fishIndexes}
        puzzle={puzzle}
        dispatchGameState={dispatchGameState}
      ></Board>
    </div>
  );
}
