console.time("Execution time");

const testInput = false;
const rawInput: string = require("fs").readFileSync(
  require("path").resolve(__dirname, testInput ? "test" : "input"),
  "utf-8"
);

type Direction = "U" | "R" | "D" | "L";
interface InputLine {
  direction: Direction;
  steps: number;
  colorCode: string;
}
let split;
const input = rawInput
  .split(/\r?\n/)
  .filter(Boolean)
  .map<InputLine>(
    (line) => (
      (split = line.split(" ")),
      {
        direction: split[0] as Direction,
        steps: Number(split[1]),
        colorCode: split[2].slice(1, -1),
      }
    )
  );

interface Vector {
  row: number;
  col: number;
}
const vectorByDirection: Record<Direction, Vector> = {
  U: { row: -1, col: 0 },
  R: { row: 0, col: 1 },
  D: { row: 1, col: 0 },
  L: { row: 0, col: -1 },
};
const rights: Record<Direction, Vector> = {
  U: vectorByDirection["R"],
  R: vectorByDirection["D"],
  D: vectorByDirection["L"],
  L: vectorByDirection["U"],
};
const lefts: Record<Direction, Vector> = {
  U: vectorByDirection["L"],
  R: vectorByDirection["U"],
  D: vectorByDirection["R"],
  L: vectorByDirection["D"],
};
const grid = new Array(2000).fill(undefined).map(() => new Array(2000).fill(0));
const position: Vector = { row: 1000, col: 1000 };
const min: Vector = { ...position };
const max: Vector = { ...position };
for (const { direction, steps } of input) {
  const diff = vectorByDirection[direction];
  for (let i = 0; i < steps; ++i) {
    position.row += diff.row;
    position.col += diff.col;
    grid[position.row][position.col] = 1;
    if (min.row > position.row) min.row = position.row;
    if (min.col > position.col) min.col = position.col;
    if (max.row < position.row) max.row = position.row;
    if (max.col < position.col) max.col = position.col;
  }
}
function canMove(row: number, col: number): boolean {
  if (row < min.row || col < min.col || row > max.row || col > max.col) return false;
  return grid[row][col] === 0;
}
function getMoves(row: number, col: number): Array<Vector> {
  const moves: Array<Vector> = [];
  if (canMove(row - 1, col)) moves.push({ row: row - 1, col });
  if (canMove(row, col + 1)) moves.push({ row, col: col + 1 });
  if (canMove(row + 1, col)) moves.push({ row: row + 1, col });
  if (canMove(row, col - 1)) moves.push({ row, col: col - 1 });
  return moves;
}
function floodFill(startRow: number, startCol: number, value: number): number {
  if (!canMove(startRow, startCol)) return 0;
  let count = 0;
  const positions: Array<Vector> = [{ row: startRow, col: startCol }];
  while (positions.length > 0) {
    const { row, col } = positions.pop() as Vector;
    if (!canMove(row, col)) continue;
    grid[row][col] = value;
    count += 1;
    positions.push(...getMoves(row, col));
  }
  return count;
}

let prev: Vector = { row: 0, col: 0 };
let left = 0;
let right = 0;
let totalSteps = 0;
for (const { direction, steps } of input) {
  const diff = vectorByDirection[direction];
  const leftDiff = lefts[direction];
  const rightDiff = rights[direction];
  for (let i = 0; i < steps; ++i) {
    totalSteps += 1;
    prev.row = position.row;
    prev.col = position.col;
    position.row += diff.row;
    position.col += diff.col;
    left += floodFill(prev.row + leftDiff.row, prev.col + leftDiff.col, 2);
    left += floodFill(position.row + leftDiff.row, position.col + leftDiff.col, 2);
    right += floodFill(prev.row + rightDiff.row, prev.col + rightDiff.col, 3);
    right += floodFill(position.row + rightDiff.row, position.col + rightDiff.col, 3);
  }
}

console.log("Part 1:", Math.min(left, right) + totalSteps);

console.timeEnd("Execution time");
export {};
