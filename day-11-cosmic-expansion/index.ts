console.time("Execution time");

const testInput = false;
const rawInput: string = require("fs").readFileSync(
  require("path").resolve(__dirname, testInput ? "test" : "input"),
  "utf-8"
);

type Tile = "." | "#";
const input = rawInput
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => line.split(""))
  .filter((line): line is Array<Tile> => line.every((symbol) => symbol === "." || symbol === "#"));
const rowIndices = new Array(input.length).fill(undefined).map((_, i) => i);
const colIndices = new Array(input[0].length).fill(undefined).map((_, i) => i);

interface Position {
  row: number;
  col: number;
}
let cumSum = 0;
const galaxylessRowsCumSum = rowIndices
  .map((row) => (input[row].every((symbol) => symbol === ".") ? 1 : 0))
  .map(((cumSum = 0), (n) => (cumSum += n)));
const galaxylessColsCumSum = colIndices
  .map((col) => 1 - rowIndices.reduce((found, row) => +(found || input[row][col] === "#"), 0))
  .map(((cumSum = 0), (n) => (cumSum += n)));
const galaxies: Array<Position> = rowIndices
  .map((row) =>
    colIndices
      .map<Position | null>((col) => (input[row][col] === "#" ? { row, col } : null))
      .filter<Position>((position): position is Position => position != null)
  )
  .flat();

function distance(a: Position, b: Position, galaxylessDistance = 1): number {
  const rowDistance =
    Math.abs(b.row - a.row) +
    Math.abs(galaxylessRowsCumSum[b.row] - galaxylessRowsCumSum[a.row]) * galaxylessDistance;
  const colDistance =
    Math.abs(b.col - a.col) +
    Math.abs(galaxylessColsCumSum[b.col] - galaxylessColsCumSum[a.col]) * galaxylessDistance;
  return rowDistance + colDistance;
}
function sumOfDistances(galaxylessDistance = 1): number {
  return galaxies
    .map((galaxy, i) =>
      galaxies.reduce(
        (sum, otherGalaxy, j) =>
          sum + (j <= i ? 0 : distance(galaxy, otherGalaxy, galaxylessDistance)),
        0
      )
    )
    .reduce((sum, curr) => sum + curr, 0);
}

console.log("Part 1:", sumOfDistances(1));
console.log("Part 2:", sumOfDistances(100000 - 1));

console.timeEnd("Execution time");
export {};
