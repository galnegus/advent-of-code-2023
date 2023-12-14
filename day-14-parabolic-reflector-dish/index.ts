console.time("Execution time");

const testInput = false;
const rawInput: string = require("fs").readFileSync(
  require("path").resolve(__dirname, testInput ? "test" : "input"),
  "utf-8"
);

const dish = rawInput
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => line.split(""));

function tiltNorth(): void {
  for (let row = 0; row < dish.length; ++row) {
    for (let col = 0; col < dish[0].length; ++col) {
      if (dish[row][col] !== "O") continue;
      let finalRow = row;
      for (let tryRow = row - 1; tryRow >= 0; --tryRow) {
        if (dish[tryRow][col] === ".") finalRow = tryRow;
        else break;
      }
      if (finalRow !== row) {
        dish[row][col] = ".";
        dish[finalRow][col] = "O";
      }
    }
  }
}
function tiltSouth(): void {
  for (let row = dish.length - 1; row >= 0; --row) {
    for (let col = 0; col < dish[0].length; ++col) {
      if (dish[row][col] !== "O") continue;
      let finalRow = row;
      for (let tryRow = row + 1; tryRow < dish.length; ++tryRow) {
        if (dish[tryRow][col] === ".") finalRow = tryRow;
        else break;
      }
      if (finalRow !== row) {
        dish[row][col] = ".";
        dish[finalRow][col] = "O";
      }
    }
  }
}
function tiltWest(): void {
  for (let col = 0; col < dish[0].length; ++col) {
    for (let row = 0; row < dish.length; ++row) {
      if (dish[row][col] !== "O") continue;
      let finalCol = col;
      for (let tryCol = col - 1; tryCol >= 0; --tryCol) {
        if (dish[row][tryCol] === ".") finalCol = tryCol;
        else break;
      }
      if (finalCol !== col) {
        dish[row][col] = ".";
        dish[row][finalCol] = "O";
      }
    }
  }
}
function tiltEast(): void {
  for (let col = dish[0].length - 1; col >= 0; --col) {
    for (let row = 0; row < dish.length; ++row) {
      if (dish[row][col] !== "O") continue;
      let finalCol = col;
      for (let tryCol = col + 1; tryCol < dish[0].length; ++tryCol) {
        if (dish[row][tryCol] === ".") finalCol = tryCol;
        else break;
      }
      if (finalCol !== col) {
        dish[row][col] = ".";
        dish[row][finalCol] = "O";
      }
    }
  }
}

function spinCycle(): void {
  tiltNorth();
  tiltWest();
  tiltSouth();
  tiltEast();
}

function load(): number {
  let res = 0;
  for (let row = 0; row < dish.length; ++row) {
    for (let col = 0; col < dish[0].length; ++col) {
      if (dish[row][col] === "O") res += dish.length - row;
    }
  }
  return res;
}

// Cycle detection: try to find a sequence of the same load()s after spinCycle(),
// I arbitrarily chose this sequence to be 8 spin cycles long because that seemed long enough, and it worked!
const cycleIndicators = new Map<string, number>();
const indicatorBuilder: Array<string> = [];
for (let i = 1; i < 1000; ++i) {
  spinCycle();
  const indicatorPart = load();
  indicatorBuilder.push(indicatorPart.toString());
  if (indicatorBuilder.length > 8) indicatorBuilder.shift();
  const indicator = indicatorBuilder.join("_");
  const lastIndexSpotted = cycleIndicators.get(indicator);
  if (lastIndexSpotted === undefined) {
    cycleIndicators.set(indicator, i);
  } else {
    const cycleLength = i - lastIndexSpotted;
    const stepsLeft = (1000000000 - i) % cycleLength;
    for (let j = 0; j < stepsLeft; ++j) {
      spinCycle();
    }
    console.log("Part 2:", load());
    break;
  }
}

console.timeEnd("Execution time");
export {};
