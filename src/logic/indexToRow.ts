export function indexToRow(index: number, numColumns: number): number {
  return Math.floor(index / numColumns);
}
