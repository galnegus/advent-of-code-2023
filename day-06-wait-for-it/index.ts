console.time("Execution time");

const testInput = false;
const rawInput: string = require("fs").readFileSync(
  require("path").resolve(__dirname, testInput ? "test.txt" : "input.txt"),
  "utf-8"
);

interface Race {
  time: number;
  record: number;
}

const input = rawInput.split(/\r?\n/).filter(Boolean);
const timesInput = [...input[0].matchAll(/\d+/g)].map(Number);
const recordInput = [...input[1].matchAll(/\d+/g)].map(Number);
const races: Array<Race> = timesInput.map((time, i) => ({ time, record: recordInput[i] }));

/**
 * Distance traveled is given by `(time - x) * x = time * x - x^2` (where x is how long button was held).
 * Points that would achieve record distance are thus given by `time * x - x^2 = record`
 * Complete the square etc... and you get:
 * ```
 *   x^2 - time * x + record = 0
 *   (x - time / 2)^2 + record - (time / 2)^2 = 0
 *   (x - time / 2)^2 = (time / 2)^2 - record
 *   x - time / 2 = +-sqrt((time / 2)^2 - record)
 *   x = time / 2 +- sqrt((time / 2)^2 - record)
 * ```
 */
function solveRaceEq({ time, record }: Race): number {
  const term = Math.sqrt((time / 2) ** 2 - record);
  const x0 = time / 2 + term;
  const x1 = time / 2 - term;
  const eps = 10e-10; // want nearest smaller/larger integer, use some small number + floor/ceil to achieve that
  return Math.floor(x0 - eps) - Math.ceil(x1 + eps) + 1;
}

console.log(
  "Part 1:",
  races.map(solveRaceEq).reduce((product, term) => product * term, 1)
);

const fixedRace: Race = {
  time: Number.parseInt([...input[0].matchAll(/\d+/g)].join("")),
  record: Number.parseInt([...input[1].matchAll(/\d+/g)].join("")),
};

console.log("Part 2:", solveRaceEq(fixedRace));

console.timeEnd("Execution time");
export {};
