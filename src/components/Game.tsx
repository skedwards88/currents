import {type GameState} from "../logic/gameInit";
import {type ReducerPayload} from "../logic/gameReducer";
import {type DisplayState} from "./App";
import ControlBar from "./ControlBar";

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

      <div id="board"></div>
    </div>
  );
}
