import {convertStringToPuzzleAndFishIndexes} from "./convertStringToPuzzleAndFishIndexes";
import {type GameState} from "./gameInit";
import {inferEventsToLog} from "./inferEventsToLog";
import {puzzles} from "./puzzles";

describe("inferEventsToLog", () => {
  const baseState: GameState = {
    puzzle: ["coral", "rock", null],
    fishHistory: [[1]],
    level: 1,
    remainingSwipes: 1,
  };

  test("new level + completed level", () => {
    const oldState = {...baseState, level: 5};
    const newState = {...baseState, level: 6};

    expect(inferEventsToLog(oldState, newState)).toStrictEqual([
      {
        eventName: "level_complete",
        eventInfo: {
          level: 5,
        },
      },
      {
        eventName: "level_started",
        eventInfo: {
          level: 6,
        },
      },
    ]);
  });

  test("completed last level", () => {
    const lastLevel = puzzles.length;
    const [lastPuzzle, _] = convertStringToPuzzleAndFishIndexes(
      puzzles[lastLevel - 1].puzzleString,
    );
    const coralIndexes = lastPuzzle.reduce(
      (accumulatedIndexes: number[], currentFeature, currentIndex) => {
        if (currentFeature === "coral") {
          accumulatedIndexes.push(currentIndex);
        }
        return accumulatedIndexes;
      },
      [],
    );

    const oldState = {...baseState, level: lastLevel, puzzle: lastPuzzle};
    const newState = {
      ...baseState,
      level: lastLevel,
      puzzle: lastPuzzle,
      fishHistory: [coralIndexes],
    };

    expect(inferEventsToLog(oldState, newState)).toStrictEqual([
      {
        eventName: "level_complete",
        eventInfo: {
          level: lastLevel,
        },
      },
    ]);
  });

  test("replay", () => {
    const oldState = {...baseState, level: 25};
    const newState = {...baseState, level: 1};

    expect(inferEventsToLog(oldState, newState)).toStrictEqual([
      {
        eventName: "replay",
      },
    ]);
  });

  test("undo", () => {
    const oldState = {
      ...baseState,
      fishHistory: [
        [2, 3],
        [3, 5],
        [9, 11],
      ],
    };
    const newState = {
      ...baseState,
      fishHistory: [
        [2, 3],
        [3, 5],
      ],
    };

    expect(inferEventsToLog(oldState, newState)).toStrictEqual([
      {
        eventName: "undo",
        eventInfo: {
          level: baseState.level,
        },
      },
    ]);
  });

  test("reset", () => {
    const oldState = {
      ...baseState,
      fishHistory: [
        [2, 3],
        [3, 5],
        [9, 11],
      ],
    };
    const newState = {...baseState, fishHistory: [[2, 3]]};

    expect(inferEventsToLog(oldState, newState)).toStrictEqual([
      {
        eventName: "reset",
        eventInfo: {
          level: baseState.level,
        },
      },
    ]);
  });
});
