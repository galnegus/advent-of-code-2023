console.time("Execution time");

const testInput = false;
const rawInput: string = require("fs").readFileSync(
  require("path").resolve(__dirname, testInput ? "test3" : "input"),
  "utf-8"
);
const input = rawInput.split(/\r?\n/).filter(Boolean);

const wordToNumber: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
};

function getCalibrationValue(line: string): number {
  const withoutLetters = line.split("").filter((char) => /^\d$/.test(char));
  return Number.parseInt(`${withoutLetters[0]}${withoutLetters[withoutLetters.length - 1]}`, 10);
}

function getAdvancedCalibrationValue(line: string): number {
  const regex = /(?=(\d|one|two|three|four|five|six|seven|eight|nine))/g;
  const match = [...line.matchAll(regex)];
  const first = match[0][1];
  const last = match[match.length - 1][1];
  return Number.parseInt(`${toNumber(first)}${toNumber(last)}`);
}

function toNumber(word: string | undefined): number {
  if (word === undefined) return 0;
  if (word.length === 1) return Number.parseInt(word);
  return wordToNumber[word] ?? 0;
}

console.log(
  "Part 1: ",
  input.map(getCalibrationValue).reduce((sum, next) => sum + next, 0)
);

console.log(
  "Part 2: ",
  input
    .map(getAdvancedCalibrationValue)
    .reduce((sum, next) => sum + next, 0)
);

console.timeEnd("Execution time");
export {};
