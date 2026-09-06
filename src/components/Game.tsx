import type {Feature} from "../logic/gameInit";
import {type GameState} from "../logic/gameInit";
import {type ReducerPayload} from "../logic/gameReducer";
import {type DisplayState} from "./App";
import ControlBar from "./ControlBar";

function Square({features}: {features: Feature[]}): React.JSX.Element {
  const className = `square ${features.join(" ")}`;

  return <div className={className}></div>;
}

function Board({puzzle}: {puzzle: Feature[][]}): React.JSX.Element {
  const squares = puzzle.map((features, index) => (
    <Square features={features} key={index}></Square>
  ));

  return <div id="board">{squares}</div>;
}

export default function Game({
  dispatchGameState,
  setDisplay,
  remainingSweeps,
  puzzleHistory,
}: {
  remainingSweeps: number;
  puzzleHistory: GameState["puzzleHistory"];
  dispatchGameState: React.Dispatch<ReducerPayload>;
  setDisplay: React.Dispatch<React.SetStateAction<DisplayState>>;
}): React.JSX.Element {
  return (
    <div id="game" className="App">
      <ControlBar setDisplay={setDisplay}></ControlBar>

      <div id="sweepControls">
        <button
          id="resetButton"
          disabled={puzzleHistory.length === 1}
          onClick={() => {
            dispatchGameState({action: "reset"});
          }}
        ></button>
        <button
          id="undoButton"
          disabled={puzzleHistory.length === 1}
          onClick={() => {
            dispatchGameState({action: "undo"});
          }}
        ></button>
        <p>{`${remainingSweeps} sweeps`}</p>
      </div>

      <Board puzzle={puzzleHistory[puzzleHistory.length - 1]}></Board>
    </div>
  );
}
