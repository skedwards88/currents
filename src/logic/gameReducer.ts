import {gameInit, type GameState} from "./gameInit";

export type ReducerPayload =
  | {
      action: "reset";
    }
  | {action: "undo"}
  | {action: "move"; newIndexes: number[]}
  | {action: "nextLevel"}
  | {action: "replay"};

export function gameReducer(
  currentGameState: GameState,
  payload: ReducerPayload,
): GameState {
  if (payload.action === "reset") {
    return {
      ...currentGameState,
      remainingSwipes:
        currentGameState.remainingSwipes +
        (currentGameState.fishHistory.length - 1),
      fishHistory: currentGameState.fishHistory.slice(0, 1),
    };
  }
  if (payload.action === "undo") {
    return {
      ...currentGameState,
      remainingSwipes: currentGameState.remainingSwipes + 1,
      fishHistory: currentGameState.fishHistory.slice(
        0,
        Math.max(currentGameState.fishHistory.length - 1),
      ),
    };
  }
  if (payload.action === "move") {
    return {
      ...currentGameState,
      remainingSwipes: currentGameState.remainingSwipes - 1,
      fishHistory: [...currentGameState.fishHistory, payload.newIndexes],
    };
  } else if (payload.action === "nextLevel") {
    return gameInit({level: currentGameState.level + 1});
  } else if (payload.action === "replay") {
    return gameInit({level: 1});
  } else {
    console.log(
      `unknown action: ${(payload as unknown as {action: string}).action}`,
    );
    return currentGameState;
  }
}
