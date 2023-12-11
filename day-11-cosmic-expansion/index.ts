console.time("Execution time");

const testInput = false;
const rawInput: string = require("fs").readFileSync(
  require("path").resolve(__dirname, testInput ? "test" : "input"),
  "utf-8"
);
const input = rawInput.split(/\r?\n/).filter(Boolean);

interface Position {
  row: number;
  col: number;
}

const rowHasNoGalaxy: Set<number> = new Set(
  new Array(input.length).fill(undefined).map((_, i) => i)
);
const colHasNoGalaxy: Set<number> = new Set(
  new Array(input[0].length).fill(undefined).map((_, i) => i)
);
const galaxies: Array<Position> = [];

for (let row = 0; row < input.length; ++row) {
  for (let col = 0; col < input[0].length; ++col) {
    if (input[row][col] === "#") {
      galaxies.push({ row, col });
      rowHasNoGalaxy.delete(row);
      colHasNoGalaxy.delete(col);
    }
  }
}

function rowDistance(a: number, b: number, emptyGalaxyDistance = 1): number {
  let distance = Math.abs(b - a);
  for (let i = Math.min(a, b); i <= Math.max(a, b); ++i) {
    if (rowHasNoGalaxy.has(i)) distance += emptyGalaxyDistance;
  }
  return distance;
}
function colDistance(a: number, b: number, emptyGalaxyDistance = 1): number {
  let distance = Math.abs(b - a);
  for (let i = Math.min(a, b); i <= Math.max(a, b); ++i) {
    if (colHasNoGalaxy.has(i)) distance += emptyGalaxyDistance;
  }
  return distance;
}
function distance(a: Position, b: Position, emptyGalaxyDistance = 1): number {
  return (
    rowDistance(a.row, b.row, emptyGalaxyDistance) + colDistance(a.col, b.col, emptyGalaxyDistance)
  );
}
function sumOfDistances(emptyGalaxyDistance = 1): number {
  return galaxies
    .map((galaxy, i) =>
      galaxies.reduce(
        (sum, otherGalaxy, j) =>
          sum + (j <= i ? 0 : distance(galaxy, otherGalaxy, emptyGalaxyDistance)),
        0
      )
    )
    .reduce((sum, curr) => sum + curr, 0);
}

console.log("Part 1:", sumOfDistances());
console.log("Part 1:", sumOfDistances(100000 - 1));

console.timeEnd("Execution time");
export {};
