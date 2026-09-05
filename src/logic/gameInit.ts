export const featureToLetterLookup = {
  fish: "F",
  coral: "C",
  rock: "R",
  whirlpool: "P",
  streamUp: "N",
  streamDown: "S",
  streamLeft: "W",
  streamRight: "E",
} as const;

export type Feature = keyof typeof featureToLetterLookup;

export type GameState = {
  level: number;
  puzzleHistory: Feature[][][];
  remainingSweeps: number;
};

export function gameInit(): GameState {
  return {
    level: 1,
    remainingSweeps: 5,
    puzzleHistory: [[["fish", "coral"], []]],
  };
}
