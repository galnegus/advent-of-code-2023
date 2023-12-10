console.time("Execution time");

const testInput = false;
const rawInput: string = require("fs").readFileSync(
  require("path").resolve(__dirname, testInput ? "test5" : "input"),
  "utf-8"
);
const diagram = rawInput.split(/\r?\n/).filter(Boolean);
const distances: Array<Array<null | number | string>> = new Array(diagram.length)
  .fill(undefined)
  .map(() => new Array(diagram[0].length).fill(null));

class Position {
  constructor(
    readonly row: number,
    readonly col: number,
    readonly previousPosition: Position | null = null
  ) {}

  left(): Position {
    if (this.previousPosition == null) return this;
    const rowDiff = this.row - this.previousPosition.row;
    const colDiff = this.col - this.previousPosition.col;
    return new Position(0 * rowDiff - 1 * colDiff, 1 * rowDiff + 0 * colDiff, this);
  }
  right(): Position {
    if (this.previousPosition == null) return this;
    const rowDiff = this.row - this.previousPosition.row;
    const colDiff = this.col - this.previousPosition.col;
    return new Position(0 * rowDiff + 1 * colDiff, -1 * rowDiff + 0 * colDiff, this);
  }
  add(other: Position): Position {
    return new Position(this.row + other.row, this.col + other.col, this);
  }
}

function findStart(): Position {
  for (let row = 0; row < diagram.length; ++row) {
    for (let col = 0; col < diagram[0].length; ++col) {
      if (diagram[row][col] === "S") return new Position(row, col);
    }
  }
  throw new Error("Something's wrong with the input, no 'S' found.");
}

const relativeMovesBySymbol: Record<string, [Position, Position]> = {
  ["|"]: [new Position(-1, 0), new Position(1, 0)],
  ["-"]: [new Position(0, -1), new Position(0, 1)],
  ["L"]: [new Position(-1, 0), new Position(0, 1)],
  ["J"]: [new Position(-1, 0), new Position(0, -1)],
  ["7"]: [new Position(0, -1), new Position(1, 0)],
  ["F"]: [new Position(0, 1), new Position(1, 0)],
};
function getMoves(position: Position): Array<Position> {
  const symbol = diagram[position.row]?.[position.col];
  const relativeMoves = relativeMovesBySymbol[symbol];
  if (relativeMoves === undefined) return [];
  return relativeMoves.map((relativeMove) => position.add(relativeMove));
}
function getCardinalMovements(position: Position): Array<Position> {
  return [
    new Position(position.row - 1, position.col, position),
    new Position(position.row + 1, position.col, position),
    new Position(position.row, position.col - 1, position),
    new Position(position.row, position.col + 1, position),
  ];
}

const start = findStart();
distances[start.row][start.col] = 0;
const startPositions = getCardinalMovements(start).filter((position) =>
  getMoves(position).some(
    (movePosition) => movePosition.row === start.row && movePosition.col === start.col
  )
);
for (const startPosition of startPositions) {
  distances[startPosition.row][startPosition.col] = 1;
}
let maxDistance = 0;
const positions: Array<Position> = [...startPositions];
while (positions.length > 0) {
  const position = positions.shift();
  if (position == null) throw new Error("Something went terribly wrong");
  const distance = distances[position.row][position.col];
  if (typeof distance !== "number") throw new Error("Something went terribly wrong");
  maxDistance = Math.max(distance, maxDistance);
  for (const movePosition of getMoves(position)) {
    if (distances[movePosition.row]?.[movePosition.col] !== null) continue;
    distances[movePosition.row][movePosition.col] = distance + 1;
    positions.push(movePosition);
  }
}

console.log("Part 1:", maxDistance);

/** PART 2 STUFF */
interface FloodFillResult {
  count: number;
  isOnBoundary: boolean;
}
function floodFill(startPosition: Position, result: FloodFillResult): void {
  let count = 0;
  let metBoundary = false;
  const positions = [startPosition];
  while (positions.length > 0) {
    const position = positions.shift();
    if (position == null) throw new Error("Something went terribly wrong");
    if (distances[position.row]?.[position.col] !== null) continue;
    count += 1;
    distances[position.row][position.col] = "I"; // can be anything, just not null or undefined
    if (
      position.row === 0 ||
      position.row === diagram.length - 1 ||
      position.col === 0 ||
      position.col === diagram[0].length - 1
    ) {
      metBoundary = true;
    }
    positions.push(...getCardinalMovements(position));
  }
  result.count += count;
  result.isOnBoundary ||= metBoundary;
}

const leftFloodFillResult: FloodFillResult = {
  count: 0,
  isOnBoundary: false,
};
const rightFloodFillResult: FloodFillResult = {
  count: 0,
  isOnBoundary: false,
};
const positionsV2: Array<Position> = [startPositions[1]];
const visitedAgain: Array<Array<boolean>> = new Array(diagram.length)
  .fill(undefined)
  .map(() => new Array(diagram[0].length).fill(false));
while (positionsV2.length > 0) {
  const position = positionsV2.shift();
  if (position == null) throw new Error("Something went terribly wrong");
  // Need to check to the left/right on both the new position and on the previous one, otherwise we might miss something while "turning"
  const left = position.left();
  const right = position.right();
  floodFill(position.add(left), leftFloodFillResult);
  floodFill(position.add(right), rightFloodFillResult);
  if (position.previousPosition !== null) {
    floodFill(position.previousPosition.add(left), leftFloodFillResult);
    floodFill(position.previousPosition.add(right), rightFloodFillResult);
  }
  for (const movePosition of getMoves(position)) {
    if (visitedAgain[movePosition.row]?.[movePosition.col] !== false) continue;
    visitedAgain[movePosition.row][movePosition.col] = true;
    positionsV2.push(movePosition);
  }
}

if (leftFloodFillResult.isOnBoundary === rightFloodFillResult.isOnBoundary)
  throw new Error("Something went wrong with the boundary checks");

console.log(
  "Part 2:",
  leftFloodFillResult.isOnBoundary ? rightFloodFillResult.count : leftFloodFillResult.count
);

console.timeEnd("Execution time");
export {};
