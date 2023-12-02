console.time("Execution time");

type CubeName = "red" | "green" | "blue";
type Cube = [CubeName, number];
type Cubes = Array<Cube>;
interface Game {
  index: number;
  cubeSets: Array<Cubes>;
}

function isCubeName(cubeName: string): cubeName is CubeName {
  return cubeName === "red" || cubeName === "green" || cubeName === "blue";
}
function isCube(cube: [string, number]): cube is Cube {
  return isCubeName(cube[0]);
}

const limits = new Map<CubeName, number>([
  ["red", 12],
  ["green", 13],
  ["blue", 14],
]);

function parseLine(line: string): Game {
  const [indexInput, cubeSetsInput] = line.split(": ");
  const index = Number.parseInt(indexInput.split(" ")[1]);
  const cubeSets = cubeSetsInput
    .split(";")
    .map((cubeSetInput) => cubeSetInput.trim().split(", ").map(parseCube));
  return {
    index,
    cubeSets,
  };
}

function parseCube(cubeString: string): Cube {
  const [n, cubeName] = cubeString.split(" ");
  if (!isCubeName(cubeName)) throw new Error("Something wrong with the cube input");
  return [cubeName, Number.parseInt(n)];
}

const testInput = false;
const rawInput: string = require("fs").readFileSync(
  require("path").resolve(__dirname, testInput ? "test" : "input"),
  "utf-8"
);
const input = rawInput.split(/\r?\n/).filter(Boolean).map(parseLine);

function gameIsPossible(game: Game): boolean {
  return game.cubeSets.every((set) =>
    set.every(([cubeName, nCubes]) => nCubes <= (limits.get(cubeName) ?? 0))
  );
}

function minimumCubes(game: Game): Cubes {
  const minCubes: Record<CubeName, number> = {
    red: 0,
    blue: 0,
    green: 0,
  };
  for (const cubeSet of game.cubeSets) {
    for (const [cubeName, nCubes] of cubeSet) {
      if (nCubes > minCubes[cubeName]) minCubes[cubeName] = nCubes;
    }
  }
  return Object.entries(minCubes).filter(isCube);
}

console.log(
  "Part 1:",
  input
    .filter(gameIsPossible)
    .map((game) => game.index)
    .reduce((sum, next) => sum + next, 0)
);
console.log(
  "Part 2:",
  input
    .map((game) => minimumCubes(game).reduce((product, [_, nextCubeN]) => product * nextCubeN, 1))
    .reduce((sum, next) => sum + next, 0)
);

console.timeEnd("Execution time");
export {};
