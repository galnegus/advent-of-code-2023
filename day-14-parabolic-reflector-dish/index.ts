console.time("Execution time");

const testInput = false;
const rawInput: string = require("fs").readFileSync(
  require("path").resolve(__dirname, testInput ? "test" : "input"),
  "utf-8"
);

type Dish = Array<Array<string>>;
const dishOne: Dish = rawInput
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => line.split(""));
const dishTwo = structuredClone(dishOne);

function moveO(dish: Dish, fromRow: number, fromCol: number, toRow: number, toCol: number): void {
  dish[fromRow][fromCol] = ".";
  dish[toRow][toCol] = "O";
}

function tiltNorth(dish: Dish): void {
  for (let row = 0; row < dish.length; ++row) {
    for (let col = 0; col < dish[0].length; ++col) {
      if (dish[row][col] !== "O") continue;
      let move;
      for (move = row - 1; move >= 0; --move) if (dish[move][col] !== ".") break;
      if (move + 1 !== row) moveO(dish, row, col, move + 1, col);
    }
  }
}
function tiltSouth(dish: Dish): void {
  for (let row = dish.length - 1; row >= 0; --row) {
    for (let col = 0; col < dish[0].length; ++col) {
      if (dish[row][col] !== "O") continue;
      let move;
      for (move = row + 1; move < dish.length; ++move) if (dish[move][col] !== ".") break;
      if (move - 1 !== row) moveO(dish, row, col, move - 1, col);
    }
  }
}
function tiltWest(dish: Dish): void {
  for (let col = 0; col < dish[0].length; ++col) {
    for (let row = 0; row < dish.length; ++row) {
      if (dish[row][col] !== "O") continue;
      let move;
      for (move = col - 1; move >= 0; --move) if (dish[row][move] !== ".") break;
      if (move + 1 !== col) moveO(dish, row, col, row, move + 1);
    }
  }
}
function tiltEast(dish: Dish): void {
  for (let col = dish[0].length - 1; col >= 0; --col) {
    for (let row = 0; row < dish.length; ++row) {
      if (dish[row][col] !== "O") continue;
      let move;
      for (move = col + 1; move < dish[0].length; ++move) if (dish[row][move] !== ".") break;
      if (move - 1 !== col) moveO(dish, row, col, row, move - 1);
    }
  }
}

function spinCycle(dish: Dish): void {
  tiltNorth(dish);
  tiltWest(dish);
  tiltSouth(dish);
  tiltEast(dish);
}

function printDish(dish: Dish): void {
  let print = "";
  for (let row = 0; row < dish.length; ++row) {
    for (let col = 0; col < dish[0].length; ++col) {
      print += dish[row][col];
    }
    print += "\n";
  }
  console.log(print);
}

function countLoad(dish: Dish): number {
  let res = 0;
  for (let row = 0; row < dish.length; ++row) {
    for (let col = 0; col < dish[0].length; ++col) {
      if (dish[row][col] === "O") res += dish.length - row;
    }
  }
  return res;
}

tiltNorth(dishOne);
console.log("Part 1:", countLoad(dishOne));

// CYCLE DETECTION: Try to find a sequence of the same n countLoad() values in a row (after each spin cycle),
// I arbitrarily chose this sequence to be 8 spin cycles long because it seemed
// unlikely that a sequence that long would result in a false positive, and it worked!
// If the cycle length turns out to be shorter than 8 it should still work, it'll just
// find a cycle length that is a multiple of the actual cycle length, which should still give the correct answer
const cycleIndicators = new Map<string, number>();
const indicatorBuilder: Array<string> = [];
for (let i = 1; i < 1000; ++i) {
  spinCycle(dishTwo);
  const indicatorPart = countLoad(dishTwo);
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
      spinCycle(dishTwo);
    }
    console.log("Part 2:", countLoad(dishTwo));
    break;
  }
}

console.timeEnd("Execution time");
export {};
