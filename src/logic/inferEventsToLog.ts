import type {GameState} from "./gameInit";
import {levelCompleteQ} from "./levelCompleteQ";
import {puzzles} from "./puzzles";

export function inferEventsToLog(
  oldState: GameState,
  newState: GameState,
): {
  eventName: string;
  eventInfo?: object;
}[] {
  const analyticsToLog = [];

  const oldLevel = oldState.level;
  const newLevel = newState.level;

  const oldFishHistoryLength = oldState.fishHistory.length;
  const newFishHistoryLength = newState.fishHistory.length;

  // Level started/completed
  if (oldLevel < newLevel) {
    analyticsToLog.push({
      eventName: "level_complete",
      eventInfo: {
        level: oldLevel,
      },
    });

    analyticsToLog.push({
      eventName: "level_started",
      eventInfo: {
        level: newLevel,
      },
    });
  }

  // Last level completed
  const oldGameComplete =
    levelCompleteQ(
      oldState.fishHistory[oldFishHistoryLength - 1],
      oldState.puzzle,
    ) && oldLevel === puzzles.length;

  const newGameComplete =
    levelCompleteQ(
      newState.fishHistory[newFishHistoryLength - 1],
      newState.puzzle,
    ) && newLevel === puzzles.length;

  if (newGameComplete && !oldGameComplete) {
    analyticsToLog.push({
      eventName: "level_complete",
      eventInfo: {
        level: newLevel,
      },
    });
  }

  // Replay
  if (oldLevel > newLevel) {
    analyticsToLog.push({
      eventName: "replay",
    });
  }

  // If level is the same but new fish history is shorter than old fish history:
  // if 1 less, log "undo"
  // if > 1 less, log "reset"
  if (oldLevel === newLevel && newFishHistoryLength < oldFishHistoryLength) {
    analyticsToLog.push({
      eventName:
        oldFishHistoryLength - newFishHistoryLength === 1 ? "undo" : "reset",
      eventInfo: {
        level: newLevel,
      },
    });
  }

  // Hint given
  if (oldState.hintCount < newState.hintCount) {
    analyticsToLog.push({
      eventName: "hint",
      eventInfo: {
        level: newLevel,
      },
    });
  }

  return analyticsToLog;
}
