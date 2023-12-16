console.time("Execution time");

const testInput = false;
const rawInput: string = require("fs").readFileSync(
  require("path").resolve(__dirname, testInput ? "test2" : "input"),
  "utf-8"
);
const grid = rawInput
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => line.split(""));

type Vector = [row: number, col: number];
interface Beam {
  position: Vector;
  velocity: Vector;
}

// I decided to do all the moves here "in-place" because I thought it might give better performance than creating new vectors
// Trying to create as few new objects as possible basically

function moveForward(beam: Beam): Beam {
  beam.position[0] = beam.position[0] + beam.velocity[0];
  beam.position[1] = beam.position[1] + beam.velocity[1];
  return beam;
}

function rotate90(vector: Vector): void {
  const [row, col] = vector;
  vector[0] = 0 * row - 1 * col;
  vector[1] = 1 * row + 0 * col;
}
function rotate270(vector: Vector): void {
  const [row, col] = vector;
  vector[0] = 0 * row + 1 * col;
  vector[1] = -1 * row + 0 * col;
}

function rotate(beam: Beam, symbol: string): Beam {
  const [rowDir, colDir] = beam.velocity;
  if (colDir !== 0) {
    if (symbol === "/") rotate90(beam.velocity);
    else rotate270(beam.velocity);
  } else if (rowDir !== 0) {
    if (symbol === "/") rotate270(beam.velocity);
    else rotate90(beam.velocity);
  } else {
    throw new Error("Something's wrong with the velocity");
  }
  return beam;
}

function split(oldBeam: Beam): Array<Beam> {
  const newBeam: Beam = {
    position: [...oldBeam.position],
    velocity: [...oldBeam.velocity],
  };
  rotate90(oldBeam.velocity);
  rotate270(newBeam.velocity);
  return [oldBeam, newBeam];
}

class VisistedCache {
  visited = new Set<number>();
  check(beam: Beam): boolean {
    const key =
      (beam.position[0] << 24) |
      (beam.position[1] << 16) |
      ((beam.velocity[0] & 3) << 8) |
      (beam.velocity[1] & 3);
    if (this.visited.has(key)) return true;
    this.visited.add(key);
    return false;
  }
}

function energizedTiles(startBeam: Beam): number {
  const energizedGrid = grid.map((row) => row.map(() => false));
  const beams: Array<Beam> = [startBeam];
  const cache = new VisistedCache();
  while (beams.length > 0) {
    const beam = beams.shift() as Beam;
    if (cache.check(beam)) continue;
    if (
      beam.position[0] >= 0 &&
      beam.position[0] < grid.length &&
      beam.position[1] >= 0 &&
      beam.position[1] < grid[0].length
    )
      energizedGrid[beam.position[0]][beam.position[1]] = true;
    const nextSymbol =
      grid[beam.position[0] + beam.velocity[0]]?.[beam.position[1] + beam.velocity[1]];
    if (nextSymbol === ".") {
      beams.push(moveForward(beam));
    } else if (nextSymbol === "/" || nextSymbol === "\\") {
      beams.push(rotate(moveForward(beam), nextSymbol));
    } else if (nextSymbol === "-" || nextSymbol === "|") {
      moveForward(beam);
      if (Math.abs(beam.velocity[1]) === (nextSymbol === "-" ? 0 : 1)) beams.push(...split(beam));
      else beams.push(beam);
    }
  }
  return energizedGrid.reduce(
    (outerSum, row) => outerSum + row.reduce((innerSum, isEnergized) => innerSum + +isEnergized, 0),
    0
  );
}

console.log("Part 1:", energizedTiles({ position: [0, -1], velocity: [0, 1] }));

const startBeams: Array<Beam> = [
  new Array(grid.length)
    .fill(undefined)
    .map((_, i) => ({ position: [-1, i], velocity: [1, 0] } satisfies Beam)),
  new Array(grid.length)
    .fill(undefined)
    .map((_, i) => ({ position: [grid.length, i], velocity: [-1, 0] } satisfies Beam)),
  new Array(grid[0].length)
    .fill(undefined)
    .map((_, i) => ({ position: [i, -1], velocity: [0, 1] } satisfies Beam)),
  new Array(grid[0].length)
    .fill(undefined)
    .map((_, i) => ({ position: [i, grid[0].length], velocity: [0, -1] } satisfies Beam)),
].flat();

console.log("Part 2:", Math.max(...startBeams.map((startBeam) => energizedTiles(startBeam))));

console.timeEnd("Execution time");
export {};
