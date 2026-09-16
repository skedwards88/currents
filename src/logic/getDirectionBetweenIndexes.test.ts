import {getDirectionBetweenIndexes} from "./getDirectionBetweenIndexes";

describe("getDirectionBetweenIndexes", () => {
  test("null if both column and row changed", () => {
    const fromIndex = 5;
    const toIndex = 1;
    const numColumns = 5;

    expect(getDirectionBetweenIndexes(fromIndex, toIndex, numColumns)).toBe(
      null,
    );
  });

  test("null if row changed > 1", () => {
    const fromIndex = 5;
    const toIndex = 15;
    const numColumns = 5;

    expect(getDirectionBetweenIndexes(fromIndex, toIndex, numColumns)).toBe(
      null,
    );
  });

  test("null if column changed > 1", () => {
    const fromIndex = 5;
    const toIndex = 7;
    const numColumns = 5;

    expect(getDirectionBetweenIndexes(fromIndex, toIndex, numColumns)).toBe(
      null,
    );
  });

  test("moved right", () => {
    const fromIndex = 5;
    const toIndex = 6;
    const numColumns = 5;

    expect(getDirectionBetweenIndexes(fromIndex, toIndex, numColumns)).toBe(
      "right",
    );
  });

  test("moved left", () => {
    const fromIndex = 6;
    const toIndex = 5;
    const numColumns = 5;

    expect(getDirectionBetweenIndexes(fromIndex, toIndex, numColumns)).toBe(
      "left",
    );
  });

  test("moved up", () => {
    const fromIndex = 5;
    const toIndex = 0;
    const numColumns = 5;

    expect(getDirectionBetweenIndexes(fromIndex, toIndex, numColumns)).toBe(
      "up",
    );
  });

  test("moved down", () => {
    const fromIndex = 0;
    const toIndex = 5;
    const numColumns = 5;

    expect(getDirectionBetweenIndexes(fromIndex, toIndex, numColumns)).toBe(
      "down",
    );
  });
});
