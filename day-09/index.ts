console.time("Execution time");

const testInput = false;
const rawInput: string = require("fs").readFileSync(
  require("path").resolve(__dirname, testInput ? "test" : "input"),
  "utf-8"
);
const report = rawInput
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => line.split(" ").map(Number));

function differences(history: Array<number>): Array<number> {
  return history.slice(1).map((num, i) => num - history[i]);
}
function predictNext(history: Array<number>): number {
  if (history.every((num) => num === 0)) return 0;
  return history[history.length - 1] + predictNext(differences(history));
}
function extrapolateBackwards(history: Array<number>): number {
  if (history.every((num) => num === 0)) return 0;
  return history[0] - extrapolateBackwards(differences(history));
}

console.log(
  "Part 1",
  report.map(predictNext).reduce((sum, curr) => sum + curr, 0)
);
console.log(
  "Part 2",
  report.map(extrapolateBackwards).reduce((sum, curr) => sum + curr, 0)
);

console.timeEnd("Execution time");
export {};
