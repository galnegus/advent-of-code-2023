console.time("Execution time");

/** Very dirty code, will clean up tomorrow */

type Input = [from: number, to: number];

function mergeInputs(inputs: Array<Input>): Array<Input> {
  inputs = inputs.sort((a, b) => a[0] - b[0]);
  const res: Array<Input> = [inputs[0]];
  for (let i = 1; i < inputs.length; ++i) {
    const first = res[res.length - 1];
    const second = inputs[i];
    if (first[1] === second[0] - 1) first[1] = second[1];
    else res.push(second);
  }
  return res;
}

class Range {
  // TODO: try remove public
  constructor(
    public readonly destinationStart: number,
    public readonly sourceStart: number,
    public readonly length: number
  ) {}

  overlapsWith([from, to]: Input): boolean {
    return from <= this.sourceStart + this.length && to >= this.sourceStart;
  }

  minOverlapLocation([from, to]: Input): number | undefined {
    if (from > this.to() || to < this.from()) return undefined;
    return this.destination(from);
  }

  from(): number {
    return this.sourceStart;
  }
  to(): number {
    return this.sourceStart + this.length - 1;
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
      if (target >= range.from() && target <= range.to()) return range.destination(target);
    }
    return target;
  }

  getNext(inputs: Array<Input>): Array<Input> {
    return mergeInputs(inputs.map((input) => this.next(input)).flat(1));
  }

  next(input: Input): Array<Input> {
    let [from, to] = input;

    const overlappingRanges = this.ranges.filter((range) => range.overlapsWith(input));

    const res: Array<Input> = [];
    for (const overlappingRange of overlappingRanges) {
      if (from < overlappingRange.from()) {
        res.push([from, overlappingRange.from() - 1]);
        from = overlappingRange.from();
      }
      from = Math.max(from, overlappingRange.from());
      const nextTo = Math.min(to, overlappingRange.to());
      res.push([overlappingRange.destination(from), overlappingRange.destination(nextTo)]);
      //if (nextTo + 1 < to)
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
  // TODO: try commented out version
  // .map<Range>((numbers) => ({
  //   destinationStart: numbers[0],
  //   sourceStart: numbers[1],
  //   length: numbers[2],
  // }))

  .map((ranges) => new RangeMap(ranges));

console.log(
  "Part 1:",
  Math.min(
    ...seeds.map((seed) => maps.reduce((prevLocation, nextSet) => nextSet.get(prevLocation), seed))
  )
);

// const soil = maps[0].getNext(seedRanges);
// const fertilizer = maps[1].getNext(soil);
// const water = maps[2].getNext(fertilizer);
// const light = maps[3].getNext(water); // need 77
// const temperature = maps[4].getNext(light); // should be 45
// const p6 = maps[5].getNext(temperature);
// const p7 = maps[6].getNext(p6);
// console.log(soil, fertilizer, water, light, temperature, p6, p7);

console.log(
  "Part 2:",
  maps.reduce((prevLocation, nextSet) => nextSet.getNext(prevLocation), seedRanges)[0][0]
);

console.timeEnd("Execution time");
export {};
