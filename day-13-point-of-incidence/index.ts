console.time("Execution time");

const testInput = false;
const rawInput: string = require("fs").readFileSync(
  require("path").resolve(__dirname, testInput ? "test2" : "input"),
  "utf-8"
);

interface Mirror {
  before: number;
  after: number;
}
function toBinaryMirrors(chars: Array<string>): Array<Mirror> {
  return chars.slice(0, -1).map<Mirror>((_, i) => ({
    before: parseInt(chars.slice(0, i + 1).join(""), 2),
    after: parseInt(
      chars
        .slice(i + 1)
        .toReversed()
        .join(""),
      2
    ),
  }));
}

interface Pattern {
  rows: Array<Array<Mirror>>;
  rowIndices: Array<number>;
  cols: Array<Array<Mirror>>;
  colIndices: Array<number>;
}
function toPattern(patternInput: Array<Array<string>>): Pattern {
  const rows = patternInput.map(toBinaryMirrors);
  const rowIndices = new Array(rows.length - 1).fill(undefined).map((_, i) => i);
  const cols = patternInput[0]
    .map((_, colIndex) => patternInput.map((_, rowIndex) => patternInput[rowIndex][colIndex]))
    .map(toBinaryMirrors);
  const colIndices = new Array(cols.length - 1).fill(undefined).map((_, i) => i);
  return { rows, rowIndices, cols, colIndices };
}

const patterns = rawInput
  .split(/\r?\n\r?\n/)
  .map((patternInput) =>
    patternInput
      .replaceAll(".", "0")
      .replaceAll("#", "1")
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => line.split(""))
  )
  .map(toPattern);

function getMask(index: number, length: number): number {
  return 2 ** (Math.min(index, length - index - 1) + 1) - 1;
}

// I needed a popcount function (nothing built-in in javascript), so I took this one from stackoverflow
// https://stackoverflow.com/a/43122214
function bitCount(n: number) {
  n = n - ((n >> 1) & 0x55555555);
  n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
  return (((n + (n >> 4)) & 0xf0f0f0f) * 0x1010101) >> 24;
}

function findMirror(
  lines: Array<Array<Mirror>>,
  indices: Array<number>,
  smudged = false
): number | undefined {
  return indices.find(
    (index) =>
      lines.reduce((sum, line) => {
        const mask = getMask(index, indices.length);
        return sum + bitCount((line[index].before & mask) ^ (line[index].after & mask));
      }, 0) === (smudged ? 1 : 0)
  );
}

function patternScore(pattern: Pattern, smudged = false): number {
  const colMirror = findMirror(pattern.rows, pattern.colIndices, smudged);
  if (colMirror !== undefined) return colMirror + 1;
  const rowMirror = findMirror(pattern.cols, pattern.rowIndices, smudged);
  if (rowMirror !== undefined) return (rowMirror + 1) * 100;
  throw new Error("Couldn't find mirror, something's wrong with the code!");
}

console.log(
  "Part 1:",
  patterns.map((pattern) => patternScore(pattern)).reduce((sum, curr) => sum + curr, 0)
);
console.log(
  "Part 2:",
  patterns.map((pattern) => patternScore(pattern, true)).reduce((sum, curr) => sum + curr, 0)
);

console.timeEnd("Execution time");
export {};
