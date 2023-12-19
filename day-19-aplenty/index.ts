console.time("Execution time");

const testInput = false;
const rawInput: string = require("fs").readFileSync(
  require("path").resolve(__dirname, testInput ? "test" : "input"),
  "utf-8"
);

type Key = "x" | "m" | "a" | "s";
type Part = Record<Key, number>;
type SingleRule = string;
interface ConditionalRule {
  key: Key;
  op: "<" | ">";
  value: number;
  target: string;
}
type Rule = SingleRule | ConditionalRule;
const isConditionalRule = (rule: Rule): rule is ConditionalRule => typeof rule === "object";
const isRequiredPart = (rule: Partial<Part>): rule is Part => Object.keys(rule).length === 4;

const rawSplit = rawInput.split(/\r?\n\r?\n/).filter(Boolean);
const workflows = new Map<string, Array<Rule>>(
  rawSplit[0]
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => [
      line.match(/^\w+/)?.[0] as string,
      (line.match(/(?<={).+(?=})/)?.[0] as string).split(",").map((ruleString) => {
        const [left, right] = ruleString.split(":");
        if (right === undefined) return ruleString;
        return {
          key: left[0] as Key,
          op: left[1] as ConditionalRule["op"],
          value: Number(left.slice(2)),
          target: right,
        };
      }),
    ])
);
const parts = rawSplit[1]
  .split(/\r?\n/)
  .filter(Boolean)
  .map((partString) => {
    const res: Partial<Part> = {};
    for (let prop of partString.slice(1, -1).split(",")) {
      const [key, value] = prop.split("=");
      if (key !== "x" && key !== "m" && key !== "a" && key !== "s")
        throw new Error("Bad part keys!");
      res[key] = Number(value);
    }
    if (!isRequiredPart(res)) throw new Error("Bad part!");
    return res;
  });

function evalRules(part: Part, rules: Array<Rule>): string {
  for (const rule of rules) {
    if (!isConditionalRule(rule)) return rule;
    const { key, op, value, target } = rule;
    if (op === ">" ? part[key] > value : part[key] < value) return target;
  }
  throw new Error("Should not be reached");
}

function isPartAccepted(part: Part): boolean {
  let label = "in";
  while (label !== "R" && label !== "A") {
    const rules = workflows.get(label);
    if (rules === undefined) throw new Error("Missing an 'in' workflow");
    label = evalRules(part, rules);
  }
  return label === "A";
}

console.log(
  "Part 1:",
  parts.filter(isPartAccepted).reduce((sum, { x, m, a, s }) => sum + x + m + a + s, 0)
);

type PartRange = Record<Key, [number, number]>;
function rangeCombinations({ x, m, a, s }: PartRange): number {
  return (x[1] - x[0] + 1) * (m[1] - m[0] + 1) * (a[1] - a[0] + 1) * (s[1] - s[0] + 1);
}
function acceptedCombinations(partRange: PartRange, workflowLabel: string): number {
  if (workflowLabel === "A") return rangeCombinations(partRange);
  if (workflowLabel === "R") return 0;
  let result = 0;
  const rules = workflows.get(workflowLabel);
  if (rules === undefined) throw new Error(`Unknown workflow label: ${workflowLabel}`);
  for (const rule of rules) {
    if (!isConditionalRule(rule)) return result + acceptedCombinations(partRange, rule);
    const { key, op, value, target } = rule;
    const newPartRange = {
      ...structuredClone(partRange),
      [key]: op === ">" ? [value + 1, partRange[key][1]] : [partRange[key][0], value - 1],
    };
    partRange[key][op === ">" ? 1 : 0] = value;
    result += acceptedCombinations(newPartRange, target);
  }
  throw new Error("No end label found for workflow :(");
}

console.log(
  "Part 2:",
  acceptedCombinations({ x: [1, 4000], m: [1, 4000], a: [1, 4000], s: [1, 4000] }, "in")
);

console.timeEnd("Execution time");
export {};
