console.time("Execution time");

import Heap from "heap-js";

const testInput = false;
const rawInput: string = require("fs").readFileSync(
  require("path").resolve(__dirname, testInput ? "test2" : "input"),
  "utf-8"
);

const map = rawInput
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => line.split("").map(Number));

interface Position {
  row: number;
  col: number;
  rowDir: number;
  colDir: number;
  consecutive: number;
  heat: number;
}
class Visited {
  visited = new Set<number>();
  constructor(private readonly minSteps: number, private readonly maxSteps: number) {}
  check({ row, col, rowDir, colDir, consecutive }: Position): boolean {
    const key =
      (row << 24) | (col << 16) | ((rowDir & 3) << 14) | ((colDir & 3) << 12) | consecutive;
    if (this.visited.has(key)) return true;
    if (consecutive >= this.minSteps)
      for (let i = 0; i <= this.maxSteps - consecutive; ++i) this.visited.add(key + i);
    else this.visited.add(key);
    return false;
  }
}

function tryDirection(
  positions: Heap<Position>,
  pos: Position,
  rowDir: number,
  colDir: number,
  minSteps: number,
  maxSteps: number
): void {
  const nextRow = pos.row + rowDir;
  const nextCol = pos.col + colDir;
  const sameDirection = rowDir === pos.rowDir && colDir === pos.colDir;

  // Boundary check
  if (nextRow < 0 || nextRow >= map.length || nextCol < 0 || nextCol >= map[0].length) return;
  // Backwards check
  if (rowDir === -pos.rowDir && colDir === -pos.colDir) return;
  // Max steps check
  if (pos.consecutive === maxSteps && sameDirection) return;
  // Min steps check
  if (pos.consecutive < minSteps && !sameDirection && !(pos.row === 0 && pos.col === 0)) return;

  positions.push({
    row: nextRow,
    col: nextCol,
    rowDir,
    colDir,
    consecutive: sameDirection ? pos.consecutive + 1 : 1,
    heat: pos.heat + map[nextRow][nextCol],
  });
}
function minHeat(minSteps: number, maxSteps: number): number {
  const positions = new Heap<Position>((a, b) => a.heat - b.heat);
  const visited = new Visited(minSteps, maxSteps);
  positions.push({ row: 0, col: 0, rowDir: 0, colDir: 0, consecutive: 0, heat: 0 });
  while (positions.length > 0) {
    const pos = positions.pop() as Position;
    if (visited.check(pos)) continue;
    if (pos.row === map.length - 1 && pos.col === map[0].length - 1 && pos.consecutive >= minSteps)
      return pos.heat;
    tryDirection(positions, pos, 1, 0, minSteps, maxSteps);
    tryDirection(positions, pos, -1, 0, minSteps, maxSteps);
    tryDirection(positions, pos, 0, 1, minSteps, maxSteps);
    tryDirection(positions, pos, 0, -1, minSteps, maxSteps);
  }
  throw new Error("Didn't find anything :(");
}

console.log("Part 1:", minHeat(0, 3));
console.log("Part 2:", minHeat(4, 10));

console.timeEnd("Execution time");
export {};
