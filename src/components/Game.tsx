import React from "react";
import type {Feature} from "../logic/gameInit";
import {type GameState} from "../logic/gameInit";
import {type ReducerPayload} from "../logic/gameReducer";
import {type DisplayState} from "./App";
import ControlBar from "./ControlBar";

export type Direction = "up" | "down" | "left" | "right";
function Square({
  feature,
  containsFish,
  sweepDirection,
}: {
  feature: Feature | null;
  containsFish: boolean;
  sweepDirection: Direction;
}): React.JSX.Element {
  const className = `square ${sweepDirection} ${feature ?? ""} ${containsFish ? "fish" : ""}`;

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
  const sweepOrigin = React.useRef({x: 0, y: 0});

  const [sweepDirection, setSweepDirection] =
    React.useState<Direction>("right");

  const squares = puzzle.map((feature, index) => (
    <Square
      feature={feature}
      containsFish={fishIndexes.includes(index)}
      sweepDirection={sweepDirection}
      key={index}
    ></Square>
  ));

  return (
    <div
      id="board"
      onPointerDown={(event) => {
        sweepOrigin.current = {x: event.screenX, y: event.screenY};

        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const dx = event.screenX - sweepOrigin.current.x;
        const dy = event.screenY - sweepOrigin.current.y;

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

        setSweepDirection(nextDirection);
      }}
      onPointerUp={(event) => {
        event.currentTarget.releasePointerCapture(event.pointerId);
        dispatchGameState({action: "move", direction: sweepDirection});
      }}
    >
      {squares}
    </div>
  );
}

export default function Game({
  dispatchGameState,
  setDisplay,
  remainingSweeps,
  fishHistory,
  puzzle,
}: {
  remainingSweeps: number;
  fishHistory: GameState["fishHistory"];
  puzzle: GameState["puzzle"];
  dispatchGameState: React.Dispatch<ReducerPayload>;
  setDisplay: React.Dispatch<React.SetStateAction<DisplayState>>;
}): React.JSX.Element {
  return (
    <div id="game" className="App">
      <ControlBar setDisplay={setDisplay}></ControlBar>

      <div id="sweepControls">
        <button
          id="resetButton"
          disabled={fishHistory.length === 1}
          onClick={() => {
            dispatchGameState({action: "reset"});
          }}
        ></button>
        <button
          id="undoButton"
          disabled={fishHistory.length === 1}
          onClick={() => {
            dispatchGameState({action: "undo"});
          }}
        ></button>
        <p>{`${remainingSweeps} sweeps`}</p>
      </div>

      <Board
        fishIndexes={fishHistory[fishHistory.length - 1]}
        puzzle={puzzle}
        dispatchGameState={dispatchGameState}
      ></Board>
    </div>
  );
}
