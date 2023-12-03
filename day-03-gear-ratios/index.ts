/**
 * Feels like I made this more complicated than it needs to be
 */

console.time("Execution time");

const testInput = false;
const rawInput: string = require("fs").readFileSync(
  require("path").resolve(__dirname, testInput ? "test" : "input"),
  "utf-8"
);
const input = rawInput.split(/\r?\n/).filter(Boolean);

const rows = input.length;
const cols = input[0].length;

interface Part {
  isPotentialGear: boolean;
}

const partMap: Array<Array<Array<Part>>> = new Array(rows)
  .fill(undefined)
  .map(() => new Array(cols).fill(undefined).map(() => new Array()));
const partNumbersByGear = new Map<Part, Array<number>>();

function isOutOfBounds(y: number, x: number): boolean {
  return x < 0 || y < 0 || x >= cols || y >= rows;
}

interface Position {
  x: number;
  y: number;
}
const relativePositionsToCheck: Array<Position> = [
  { x: -1, y: -1 },
  { x: 0, y: -1 },
  { x: 1, y: -1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: -1, y: 1 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
];

function isDigit(char: string): boolean {
  return char >= "0" && char <= "9";
}

function isSymbol(char: string): boolean {
  return !isDigit(char) && char != ".";
}

// Pass 1, build the `partMap` 2d-array and initialize the `partNumbersByGear` map
for (let y = 0; y < rows; ++y) {
  for (let x = 0; x < cols; ++x) {
    const char = input[y][x];
    if (isSymbol(char)) {
      const isGear = char === "*";
      const part: Part = {
        isPotentialGear: isGear,
      };
      if (isGear) partNumbersByGear.set(part, []);
      for (const relativePosition of relativePositionsToCheck) {
        if (isOutOfBounds(y + relativePosition.y, x + relativePosition.x)) continue;
        partMap[y + relativePosition.y][x + relativePosition.x].push(part);
      }
    }
  }
}

// Pass 2, build `numbers` and `partNumbersByGear`
const numbers: Array<number> = [];
const addNumbers = (numBuilder: string, adjacentParts: Set<Part>) => {
  const numberToAdd = Number.parseInt(numBuilder, 10);
  numbers.push(numberToAdd);
  for (const adjacentPart of adjacentParts) {
    if (adjacentPart.isPotentialGear) partNumbersByGear.get(adjacentPart)?.push(numberToAdd);
  }
};
for (let y = 0; y < rows; ++y) {
  let numBuilder = "";
  let adjacentParts = new Set<Part>();
  for (let x = 0; x < cols; ++x) {
    const char = input[y][x];
    if (isDigit(char)) {
      numBuilder += char;
      if (partMap[y][x].length > 0) partMap[y][x].forEach((part) => adjacentParts.add(part));
    } else {
      if (numBuilder === "") {
        continue;
      } else {
        if (adjacentParts.size > 0) {
          addNumbers(numBuilder, adjacentParts);
        }
        numBuilder = "";
        adjacentParts = new Set<Part>();
      }
    }
  }
  if (numBuilder !== "" && adjacentParts.size > 0) {
    addNumbers(numBuilder, adjacentParts);
  }
}

console.log(
  "Part 1:",
  numbers.reduce((sum, next) => sum + next, 0)
);
console.log(
  "Part 2:",
  [...partNumbersByGear.values()]
    .filter((partNumbers) => partNumbers.length === 2)
    .reduce((sum, partNumbers) => sum + partNumbers[0] * partNumbers[1], 0)
);

console.timeEnd("Execution time");
export {};
