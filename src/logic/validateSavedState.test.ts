import {type GameState} from "./gameInit";
import {validateSavedState} from "./validateSavedState";

describe("validateSavedState", () => {
  const validState: GameState = {
    level: 1,
    maxSwipes: 2,
    fishHistory: [[17]],
    puzzle: [
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      "coral",
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ],
  };

  test("false if no saved state", () => {
    // @ts-expect-error intentionally testing invalid input
    expect(validateSavedState(null)).toBe(false);
    // @ts-expect-error intentionally testing invalid input
    expect(validateSavedState(undefined)).toBe(false);
    // @ts-expect-error intentionally testing invalid input
    expect(validateSavedState({})).toBe(false);
  });

  test("false if invalid level", () => {
    // @ts-expect-error intentionally testing invalid input
    expect(validateSavedState({...validState, level: "1"})).toBe(false);
    expect(validateSavedState({...validState, level: -1})).toBe(false);
    expect(validateSavedState({...validState, level: 0})).toBe(false);
    expect(validateSavedState({...validState, level: 1000})).toBe(false);
  });

  test("false if invalid swipes", () => {
    // @ts-expect-error intentionally testing invalid input
    expect(validateSavedState({...validState, maxSwipes: "1"})).toBe(false);
    expect(validateSavedState({...validState, maxSwipes: -1})).toBe(false);
  });

  test("false if puzzle wrong length", () => {
    expect(validateSavedState({...validState, puzzle: ["coral", "rock"]})).toBe(
      false,
    );
    expect(
      validateSavedState({
        ...validState,
        puzzle: [...validState.puzzle, "rock"],
      }),
    ).toBe(false);
  });

  test("false if puzzle doesn't match official", () => {
    const newPuzzle = [...validState.puzzle];
    newPuzzle[0] = "rock";
    expect(validateSavedState({...validState, puzzle: newPuzzle})).toBe(false);
  });

  test("false if any fish indexes is wrong length", () => {
    expect(
      validateSavedState({...validState, fishHistory: [[11], [11, 12]]}),
    ).toBe(false);
  });

  test("false if any fish indexes is invalid", () => {
    expect(
      // @ts-expect-error intentionally testing invalid input
      validateSavedState({...validState, fishHistory: [[11], ["12"]]}),
    ).toBe(false);
    expect(validateSavedState({...validState, fishHistory: [[11], [-1]]})).toBe(
      false,
    );
    expect(
      validateSavedState({...validState, fishHistory: [[11], [1000]]}),
    ).toBe(false);
  });

  test("true otherwise", () => {
    expect(validateSavedState(validState)).toBe(true);
    expect(validateSavedState({...validState, maxSwipes: 0})).toBe(true);
  });
});
