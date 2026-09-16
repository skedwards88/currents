import {type Feature} from "./gameInit";
import {levelCompleteQ} from "./levelCompleteQ";

describe("levelCompleteQ", () => {
  const puzzle: (Feature | null)[] = ["coral", "rock", "coral", null, null];

  test("true if all fish are on a coral", () => {
    expect(levelCompleteQ([0, 2], puzzle)).toBe(true);
  });

  test("true if all fish are on a coral even if not all coral are occuped", () => {
    expect(levelCompleteQ([2], puzzle)).toBe(true);
  });

  test("false if any fish aren't on a coral", () => {
    expect(levelCompleteQ([2, 3], puzzle)).toBe(false);
  });
});
