import {getNextIndex} from "./getNextIndex";

describe("getNextIndex", () => {
  test("move up within board", () => {
    expect(getNextIndex(8, "up")).toBe(3);
    expect(getNextIndex(5, "up")).toBe(0);
  });

  test("move down within board", () => {
    expect(getNextIndex(24, "down")).toBe(29);
    expect(getNextIndex(29, "down")).toBe(34);
  });

  test("move left within board", () => {
    expect(getNextIndex(26, "left")).toBe(25);
    expect(getNextIndex(1, "left")).toBe(0);
  });

  test("move right within board", () => {
    expect(getNextIndex(11, "right")).toBe(12);
    expect(getNextIndex(33, "right")).toBe(34);
  });

  test("move up out of bounds does not move", () => {
    expect(getNextIndex(0, "up")).toBe(0);
    expect(getNextIndex(3, "up")).toBe(3);
  });

  test("move down out of bounds does not move", () => {
    expect(getNextIndex(31, "down")).toBe(31);
    expect(getNextIndex(34, "down")).toBe(34);
  });

  test("move left out of bounds does not move", () => {
    expect(getNextIndex(0, "left")).toBe(0);
    expect(getNextIndex(20, "left")).toBe(20);
  });

  test("move right out of bounds does not move", () => {
    expect(getNextIndex(34, "right")).toBe(34);
    expect(getNextIndex(9, "right")).toBe(9);
  });

  test("errors for out of bound indexes", () => {
    expect(() => getNextIndex(-2, "up")).toThrow("index -2 is out of bounds");
    expect(() => getNextIndex(35, "up")).toThrow("index 35 is out of bounds");
  });

  test("errors for unknown direction", () => {
    // @ts-expect-error intentionally testing invalid input
    expect(() => getNextIndex(12, "north")).toThrow("unknown direction north");
  });
});
