console.time("Execution time");

const testInput = false;
const rawInput: string = require("fs").readFileSync(
  require("path").resolve(__dirname, testInput ? "test3" : "input"),
  "utf-8"
);

interface Node {
  left: Node | null;
  right: Node | null;
  name: string;
}
const nodeMap: Record<string, Node> = {};
const instructionMap: Record<"L" | "R", keyof Node> = {
  L: "left",
  R: "right",
};

const input = rawInput.split(/\r?\n/).filter(Boolean);
const instructions: Array<keyof Node> = input[0].split("").map((char) => {
  if (char === "L" || char === "R") return instructionMap[char];
  throw new Error("Something's wrong with the input");
});
for (const line of input.slice(1)) {
  const nodeName = line.slice(0, 3);
  nodeMap[nodeName] = { left: null, right: null, name: nodeName };
}
for (const line of input.slice(1)) {
  const nodeName = line.slice(0, 3);
  const instructions = [...line.matchAll(/(?<=[(\s])\w+/g)];
  nodeMap[nodeName].left = nodeMap[instructions[0][0]];
  nodeMap[nodeName].right = nodeMap[instructions[1][0]];
}

function stepsToZ(node: Node, isZ: (node: Node) => boolean): number {
  let steps = 0;
  let currentNode = node;
  while (!isZ(currentNode)) {
    const nextInstruction = instructions[steps % instructions.length];
    const nextNode = currentNode?.[nextInstruction];
    if (nextNode == null || typeof nextNode !== "object")
      throw new Error("Something's wrong with the nodes");
    currentNode = nextNode;
    steps += 1;
  }
  return steps;
}

const stepsToZZZ = stepsToZ(nodeMap["AAA"], (node) => node.name === "ZZZ");
console.log("Part 1:", stepsToZZZ);

// My initial attempt at solving part 2 was bad (super slow), but I discovered some things in the process which led to this solution:
//  - All haunted roads are cyclical 🤷 AND it takes the same amount of steps to reach "Z" from "A", as it takes to reach "Z" from (same) "Z" for all roads,
//    so I just need to compute steps to reach "Z" from "A" to get the "cycle length"
//  - The number of instructions (instructions.length) is a divisor of "amount of steps" needed to reach "Z" for all the haunted roads.
//    SO they all have a shared factor, which (along with first discovery) felt like an obvious hint to "combine" them somehow (lcm) to get the answer.
//
//  The first version was basically trying to find cycles and then using those cycle lengths to find the lcm numerically, one cycle at a time,
//  but that was stupidly slow, so it's Euclid's algorithm to the rescue instead 🙃.

const allHauntedStepsToZ = Object.values(nodeMap)
  .filter((node) => node.name.endsWith("A"))
  .map((node) => stepsToZ(node, (node) => node.name.endsWith("Z")));

function gcd(a: number, b: number): number {
  if (a === 0) return b;
  return gcd(b % a, a);
}
function lcm(a: number, b: number): number;
function lcm(a: Array<number>): number;
function lcm(a: number | Array<number>, b?: number): number {
  if (Array.isArray(a)) return a.reduce((left, right) => lcm(left, right));
  if (b === undefined) throw new Error("Something's wrong with the arguments 😿");
  return b * (a / gcd(a, b));
}

console.log("Part 2:", lcm(allHauntedStepsToZ));

console.timeEnd("Execution time");
export {};
