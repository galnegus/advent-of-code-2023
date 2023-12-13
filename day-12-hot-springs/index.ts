console.time("Execution time");

const testInput = false;
const rawInput: string = require("fs").readFileSync(
  require("path").resolve(__dirname, testInput ? "test2" : "input"),
  "utf-8"
);

const springTypes = [".", "#", "?"] as const;
type SpringType = (typeof springTypes)[number];
interface InputRow {
  springs: Array<SpringType>;
  records: Array<number>;
  dotDistances: Array<number>;
  lastHashIndex: number;
}

const splitInput = rawInput
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => line.split(" "));

function buildInputRow(split: Array<string>): InputRow {
  const springs = split[0]
    .replace(/^\.+|\.+$/g, "") // dots at start and end do nothing, remove them!
    .replace(/\.{2,}/g, ".") // consecutive dots do nothing, remove them!
    .split("")
    .filter((char): char is SpringType => springTypes.includes(char as SpringType));
  const records = split[1].split(",").map(Number);
  let dotCounter = 0;
  const dotDistances = springs
    .toReversed()
    .map((state) => (dotCounter = state === "." ? 0 : dotCounter + 1))
    .toReversed();
  const lastHashIndex = springs.lastIndexOf("#");
  return { springs, records, dotDistances, lastHashIndex };
}

const input = splitInput.map(buildInputRow);
const extendedInput = splitInput
  .map((split) => [`${split[0]}?`.repeat(5).slice(0, -1), `${split[1]},`.repeat(5).slice(0, -1)])
  .map(buildInputRow);

class Cache {
  results = new Map<number, number>();
  get(springsIndex: number, recordsIndex: number): number | undefined {
    return this.results.get((springsIndex << 16) | recordsIndex);
  }
  set(springsIndex: number, recordsIndex: number, value: number): void {
    this.results.set((springsIndex << 16) | recordsIndex, value);
  }
}

function arrangements(
  row: InputRow,
  springsIndex: number,
  recordsIndex: number,
  minimumLength: number,
  cache: Cache
): number {
  const cacheResult = cache.get(springsIndex, recordsIndex);
  if (cacheResult !== undefined) return cacheResult;
  if (recordsIndex >= row.records.length) {
    if (springsIndex <= row.lastHashIndex) {
      return 0;
    }
    return 1;
  }
  if (springsIndex >= row.springs.length) return 0;
  const record = row.records[recordsIndex];
  const canPlaceSpring =
    record <= row.dotDistances[springsIndex] && row.springs[springsIndex + record] !== "#";
  const placeSpring = canPlaceSpring
    ? arrangements(row, springsIndex + record + 1, recordsIndex + 1, minimumLength - record, cache)
    : 0;
  const moveOn =
    row.springs[springsIndex] !== "#"
      ? arrangements(row, springsIndex + 1, recordsIndex, minimumLength, cache)
      : 0;
  const numberOfArrangements = placeSpring + moveOn;
  cache.set(springsIndex, recordsIndex, numberOfArrangements);
  return numberOfArrangements;
}

console.log(
  "Part 1:",
  input
    .map((row, i) =>
      arrangements(
        row,
        0,
        0,
        row.records.reduce((sum, curr) => sum + curr, 0),
        new Cache()
      )
    )
    .reduce((sum, curr) => sum + curr, 0)
);

console.log(
  "Part 2:",
  extendedInput
    .map((row, i) =>
      arrangements(
        row,
        0,
        0,
        row.records.reduce((sum, curr) => sum + curr, 0),
        new Cache()
      )
    )
    .reduce((sum, curr) => sum + curr, 0)
);
console.timeEnd("Execution time");
export {};
