export const featureToLetterLookup = {
  fish: "F",
  coral: "C",
  rock: "R",
  whirlpool: "W",
  stream: "S",
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
