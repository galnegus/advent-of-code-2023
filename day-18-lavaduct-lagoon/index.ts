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
}
let split;
const p1Input = rawInput
  .split(/\r?\n/)
  .filter(Boolean)
  .map<InputLine>(
    (line) => (
      (split = line.split(" ")),
      {
        direction: split[0] as Direction,
        steps: Number(split[1]),
      }
    )
  );
const hexaDirection: Record<string, Direction> = {
  ["0"]: "R",
  ["1"]: "D",
  ["2"]: "L",
  ["3"]: "U",
};
const p2Input = rawInput
  .split(/\r?\n/)
  .filter(Boolean)
  .map<InputLine>(
    (line) => (
      (split = line.split(" ")),
      {
        direction: hexaDirection[split[2].slice(-2).slice(0, 1)],
        steps: parseInt(split[2].slice(-7).slice(0, -2), 16),
      }
    )
  );

class Vertex {
  constructor(public row: number, public col: number) {}
  subtract(other: Vertex) {
    this.row -= other.row;
    this.col -= other.col;
  }
  copy() {
    return new Vertex(this.row, this.col);
  }
}

const vertexByDirection: Record<Direction, Vertex> = {
  U: new Vertex(-1, 0),
  R: new Vertex(0, 1),
  D: new Vertex(1, 0),
  L: new Vertex(0, -1),
};
const rights: Record<Direction, Vertex> = {
  U: vertexByDirection["R"],
  R: vertexByDirection["D"],
  D: vertexByDirection["L"],
  L: vertexByDirection["U"],
};
const lefts: Record<Direction, Vertex> = {
  U: vertexByDirection["L"],
  R: vertexByDirection["U"],
  D: vertexByDirection["R"],
  L: vertexByDirection["D"],
};

const zero: Vertex = new Vertex(0, 0);
function computeArea(input: Array<InputLine>): number {
  // Get positions of all vertices, and min/max vertex of digsite
  const vertex: Vertex = zero.copy();
  const vertices: Array<Vertex> = [zero.copy()];
  const min: Vertex = zero.copy();
  const max: Vertex = zero.copy();
  for (const { direction, steps } of input) {
    const diff = vertexByDirection[direction];
    vertex.row += diff.row * steps;
    vertex.col += diff.col * steps;
    if (min.row > vertex.row) min.row = vertex.row;
    if (min.col > vertex.col) min.col = vertex.col;
    if (max.row < vertex.row) max.row = vertex.row;
    if (max.col < vertex.col) max.col = vertex.col;
    vertices.push(vertex.copy());
  }

  // Adjust all vertices so that min = (0, 0)
  for (const vertex of vertices) {
    vertex.subtract(min);
  }
  zero.subtract(min);
  max.subtract(min);
  min.row = 0;
  min.col = 0;

  // Construct a "contracted" grid, where sparse grid regions are contracted into a single vertex
  // vertexSizeGrid[row][col] will indicate how many actual vertices that particular contracted vertex contains
  const rowsWithVertices = [...new Set(vertices.map((vertex) => vertex.row))].sort((a, b) => a - b);
  const colsWithVertices = [...new Set(vertices.map((vertex) => vertex.col))].sort((a, b) => a - b);
  function sideLengths(sideWithVertices: Array<number>): Array<number> {
    const res: Array<number> = [1];
    for (let row = 1; row < sideWithVertices.length; ++row) {
      const distance = sideWithVertices[row] - sideWithVertices[row - 1];
      if (distance > 1) res.push(distance - 1);
      res.push(1);
    }
    return res;
  }
  const rowLengths = sideLengths(rowsWithVertices);
  const colLengths = sideLengths(colsWithVertices);
  const vertexSizeGrid = rowLengths.map((rowLength) =>
    colLengths.map((colLength) => rowLength * colLength)
  );

  // Find start position in "contracted" grid coordinates
  function findStartIndex(sideLengths: Array<number>, startLength: number): number {
    for (let i = 0, sum = 0; i < sideLengths.length; ++i) {
      if (startLength === sum) return i;
      sum += sideLengths[i];
    }
    throw new Error("Couldn't find start side!!!");
  }
  const startRow = findStartIndex(rowLengths, zero.row);
  const startCol = findStartIndex(colLengths, zero.col);

  // Follow path of digger, fill in `1` where the boundaries are dug
  const grid = new Array(rowLengths.length)
    .fill(undefined)
    .map(() => new Array(colLengths.length).fill(0));
  const position: Vertex = new Vertex(startRow, startCol);
  for (const { direction, steps } of input) {
    const diff = vertexByDirection[direction];
    for (let stepsLeft = steps; stepsLeft > 0; ) {
      position.row += diff.row;
      position.col += diff.col;
      grid[position.row][position.col] = 1;
      stepsLeft -= vertexSizeGrid[position.row][position.col];
    }
  }

  // Floodfill helpers
  function canMove(row: number, col: number): boolean {
    if (row < 0 || col < 0 || row >= grid.length || col >= grid[0].length) return false;
    return grid[row][col] === 0;
  }
  function getMoves(row: number, col: number): Array<Vertex> {
    const moves: Array<Vertex> = [];
    if (canMove(row - 1, col)) moves.push(new Vertex(row - 1, col));
    if (canMove(row, col + 1)) moves.push(new Vertex(row, col + 1));
    if (canMove(row + 1, col)) moves.push(new Vertex(row + 1, col));
    if (canMove(row, col - 1)) moves.push(new Vertex(row, col - 1));
    return moves;
  }
  function floodFill(startRow: number, startCol: number, value: number): number {
    if (!canMove(startRow, startCol)) return 0;
    let count = 0;
    const positions: Array<Vertex> = [new Vertex(startRow, startCol)];
    while (positions.length > 0) {
      const { row, col } = positions.pop() as Vertex;
      if (!canMove(row, col)) continue;
      grid[row][col] = value;
      count += vertexSizeGrid[row][col];
      positions.push(...getMoves(row, col));
    }
    return count;
  }

  // Floodfill dig, traversing the digger path again, but floodfilling left and right along the path
  let prev: Vertex = new Vertex(0, 0);
  let leftHitBoundary = false;
  let left = 0;
  let right = 0;
  let totalSteps = 0;
  for (const { direction, steps } of input) {
    const diff = vertexByDirection[direction];
    const leftDiff = lefts[direction];
    const rightDiff = rights[direction];

    for (let stepsLeft = steps; stepsLeft > 0; ) {
      totalSteps += vertexSizeGrid[position.row][position.col];
      prev.row = position.row;
      prev.col = position.col;
      position.row += diff.row;
      position.col += diff.col;
      left += floodFill(prev.row + leftDiff.row, prev.col + leftDiff.col, 2);
      left += floodFill(position.row + leftDiff.row, position.col + leftDiff.col, 2);
      right += floodFill(prev.row + rightDiff.row, prev.col + rightDiff.col, 3);
      right += floodFill(position.row + rightDiff.row, position.col + rightDiff.col, 3);
      stepsLeft -= vertexSizeGrid[position.row][position.col];

      // If "left" crossed the boundary, that means the left floodfill is the outer one, otherwise it's the inner one
      if (prev.row + leftDiff.row < 0 || position.row + leftDiff.row < 0) leftHitBoundary = true;
    }
  }
  return (leftHitBoundary ? right : left) + totalSteps;
}

console.log("Part 1:", computeArea(p1Input));
console.log("Part 2:", computeArea(p2Input));

console.timeEnd("Execution time");
export {};
