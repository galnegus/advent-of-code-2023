console.time("Execution time");

type Input = [from: number, to: number];

class Range {
  public readonly from: number;
  public readonly to: number;

  constructor(
    readonly destinationStart: number,
    readonly sourceStart: number,
    readonly length: number
  ) {
    this.from = sourceStart;
    this.to = sourceStart + length - 1;
  }

  overlapsWith([from, to]: Input): boolean {
    return from <= this.sourceStart + this.length && to >= this.sourceStart;
  }
  destination(target: number): number {
    return this.destinationStart + target - this.sourceStart;
  }
}

class RangeMap {
  constructor(private ranges: Array<Range>) {
    this.ranges = this.ranges.sort((a, b) => a.sourceStart - b.sourceStart);
  }

  get(target: number): number {
    for (const range of this.ranges) {
      if (target >= range.from && target <= range.to) return range.destination(target);
    }
    return target;
  }

  getInputs(inputs: Array<Input>): Array<Input> {
    return inputs
      .map((input) => this.getInput(input))
      .flat(1)
      .sort((a, b) => a[0] - b[0]);
  }

  getInput(input: Input): Array<Input> {
    let [from, to] = input;

    const overlappingRanges = this.ranges.filter((range) => range.overlapsWith(input));

    const res: Array<Input> = [];
    for (const overlappingRange of overlappingRanges) {
      if (from < overlappingRange.from) {
        res.push([from, overlappingRange.from - 1]);
        from = overlappingRange.from;
      }
      from = Math.max(from, overlappingRange.from);
      const nextTo = Math.min(to, overlappingRange.to);
      res.push([overlappingRange.destination(from), overlappingRange.destination(nextTo)]);
      from = nextTo + 1;
    }
    if (to - from > 0) res.push([from, to]);
    return res;
  }
}

const testInput = false;
const rawInput: string = require("fs").readFileSync(
  require("path").resolve(__dirname, testInput ? "test.txt" : "input.txt"),
  "utf-8"
);
const inputSections = rawInput.split(/\r?\n\r?\n/);
const seeds = inputSections.shift()?.match(/(\d+)/g)?.map(Number);
if (seeds == null) throw new Error("Seeds should not be null, something's up with the input");
const seedRanges: Array<Input> = seeds.reduce<Array<Input>>(
  (acc, seed, i) => (i % 2 ? acc : [...acc, [seed, seed + seeds[i + 1]]]),
  []
);

const maps = inputSections
  .map((inputSection) =>
    inputSection
      .split(/map:\r?\n/)[1]
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => line.split(/\s/).map(Number))
      .map((numbers) => new Range(numbers[0], numbers[1], numbers[2]))
  )
  .map((ranges) => new RangeMap(ranges));

console.log(
  "Part 1:",
  Math.min(
    ...seeds.map((seed) => maps.reduce((prevLocation, nextSet) => nextSet.get(prevLocation), seed))
  )
);

console.log(
  "Part 2:",
  maps.reduce((prevLocation, nextSet) => nextSet.getInputs(prevLocation), seedRanges)[0][0]
);

console.timeEnd("Execution time");
export {};
