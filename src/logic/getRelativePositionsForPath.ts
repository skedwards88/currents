import {getXYForIndex} from "./getXYForIndex";

export function getRelativePositionsForPath(
  path: number[],
  squareWidth: number,
  numColumns: number,
): {x: number; y: number}[] {
  const finalIndex = path[path.length - 1];

  const finalPosition = getXYForIndex(finalIndex, squareWidth, numColumns);

  return path.map((index) => {
    const position = getXYForIndex(index, squareWidth, numColumns);
    return {x: position.x - finalPosition.x, y: position.y - finalPosition.y};
  });
}
