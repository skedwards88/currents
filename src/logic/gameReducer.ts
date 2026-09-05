import {type GameState} from "./gameInit";

export type ReducerPayload =
  | {
      action: "reset";
    }
  | {action: "undo"};

export function gameReducer(
  currentGameState: GameState,
  payload: ReducerPayload,
): GameState {
  if (payload.action === "reset") {
    return {
      ...currentGameState,
      remainingSweeps:
        currentGameState.remainingSweeps +
        (currentGameState.puzzleHistory.length - 1),
      puzzleHistory: currentGameState.puzzleHistory.slice(0, 1),
    };
  }
  if (payload.action === "undo") {
    return {
      ...currentGameState,
      remainingSweeps: currentGameState.remainingSweeps + 1,
      puzzleHistory: currentGameState.puzzleHistory.slice(
        0,
        Math.max(currentGameState.puzzleHistory.length - 1),
      ),
    };
  } else {
    console.log(
      `unknown action: ${(payload as unknown as {action: string}).action}`,
    );
    return currentGameState;
  }
}
