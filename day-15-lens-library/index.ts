console.time("Execution time");

const testInput = false;
const rawInput: string = require("fs").readFileSync(
  require("path").resolve(__dirname, testInput ? "test" : "input"),
  "utf-8"
);
const steps = rawInput.replace(/\r?\n/, "").split(",").filter(Boolean);

function hash(step: string): number {
  return step.split("").reduce((res, curr) => ((res + curr.charCodeAt(0)) * 17) % 256, 0);
}

console.log(
  "Part 1:",
  steps.map(hash).reduce((sum, curr) => sum + curr, 0)
);

class Box {
  private positionByLabel = new Map<string, number>();
  private focalLengthByLabel = new Map<string, number>();
  private lastPosition = 0;
  dash(label: string): void {
    if (!this.positionByLabel.has(label)) return;
    this.positionByLabel.delete(label);
    this.focalLengthByLabel.delete(label);
  }
  equals(label: string, focalLength: number): void {
    if (!this.focalLengthByLabel.has(label)) this.positionByLabel.set(label, this.lastPosition++);
    this.focalLengthByLabel.set(label, focalLength);
  }
  getLenses(): Array<number> {
    return [...this.positionByLabel.entries()]
      .sort(([_, a], [__, b]) => a - b)
      .map(([label]) => this.focalLengthByLabel.get(label))
      .filter((focalLength): focalLength is number => typeof focalLength === "number");
  }
  hasLenses(): boolean {
    return this.positionByLabel.size > 0;
  }
}

const boxes = new Array(256).fill(undefined).map(() => new Box());
for (const step of steps) {
  const split = step.split(/=|-/);
  const label = split[0];
  const box = boxes[hash(label)];
  if (split[1] === "") {
    box.dash(label);
  } else {
    box.equals(label, Number(split[1]));
  }
}

console.log(
  "Part 2:",
  boxes
    .map((box, boxIndex) =>
      box
        .getLenses()
        .reduce(
          (sum, focalLength, lensIndex) => sum + (boxIndex + 1) * focalLength * (lensIndex + 1),
          0
        )
    )
    .reduce((sum, curr) => sum + curr, 0)
);

console.timeEnd("Execution time");
export {};
