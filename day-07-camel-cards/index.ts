console.time("Execution time");

const testInput = false;
const rawInput: string = require("fs").readFileSync(
  require("path").resolve(__dirname, testInput ? "test" : "input"),
  "utf-8"
);

const cards = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"] as const;
const cardStrength = new Map(cards.map((card, i) => [card, cards.length - i]));
type Card = (typeof cards)[number];

const handTypes = ["5", "4,1", "3,2", "3,1,1", "2,2,1", "2,1,1,1", "1,1,1,1,1"] as const;
const handTypeStrength = new Map(handTypes.map((hand, i) => [hand, handTypes.length - i]));
type HandType = (typeof handTypes)[number];

function isCard(str: string): str is Card {
  return str.length === 1 && (cardStrength as Map<string, number>).has(str);
}

function isHandType(str: string): str is HandType {
  return (handTypeStrength as Map<string, number>).has(str);
}

function getCardStrength(card: Card, jokerMode = false): number {
  if (jokerMode && card === "J") return -1;
  return cardStrength.get(card) ?? 0;
}
function getHandTypeStrength(handType: HandType): number {
  return handTypeStrength.get(handType) ?? 0;
}

function toHand(str: string): Array<Card> {
  return str.split("").filter(isCard);
}

function getHandType(hand: Array<Card>, jokerMode = false): HandType {
  const cardCount = new Map(cards.map((validCard) => [validCard, 0]));
  for (const card of hand) {
    cardCount.set(card, (cardCount.get(card) ?? 0) + 1);
  }

  const jokers = cardCount.get("J") ?? 0;
  if (!jokerMode || jokers === 0) {
    const handType = [...cardCount.values()]
      .filter(Boolean)
      .sort((a, b) => b - a)
      .toString();
    if (!isHandType(handType))
      throw new Error(`Something terrible must've happened to the input, handType: ${handType}`);
    return handType;
  }

  if (jokers === 5) return "5";
  const jokerCandidates = [...cardCount.entries()]
    .filter(([card]) => card !== "J")
    .map(([_, count]) => count)
    .filter(Boolean)
    .sort((a, b) => b - a);
  const handType = [jokerCandidates[0] + jokers, ...jokerCandidates.slice(1)].toString();
  if (!isHandType(handType))
    throw new Error(`Something terrible must've happened to the input, handType: ${handType}`);
  return handType;
}

function compareHands(a: Array<Card>, b: Array<Card>, jokerMode = false): number {
  const aHandStrength = getHandTypeStrength(getHandType(a, jokerMode));
  const bHandStrength = getHandTypeStrength(getHandType(b, jokerMode));
  if (aHandStrength > bHandStrength) return 1;
  if (aHandStrength < bHandStrength) return -1;

  for (let i = 0; i < 5; ++i) {
    const aCardStrength = getCardStrength(a[i], jokerMode);
    const bCardStrength = getCardStrength(b[i], jokerMode);
    if (aCardStrength > bCardStrength) return 1;
    if (aCardStrength < bCardStrength) return -1;
  }
  throw new Error("a and b are somehow equal, this should never happen!");
}

interface Bid {
  hand: Array<Card>;
  amount: number;
}

const inputHands = rawInput
  .split(/\r?\n/)
  .filter(Boolean)
  .map<Bid>((line) => {
    const split = line.split(" ");
    return {
      hand: toHand(split[0]),
      amount: Number(split[1]),
    };
  });

console.log(
  "Part 1:",
  inputHands
    .toSorted((a, b) => compareHands(a.hand, b.hand))
    .reduce((sum, bid, i) => sum + bid.amount * (i + 1), 0)
);

console.log(
  "Part 2:",
  inputHands
    .toSorted((a, b) => compareHands(a.hand, b.hand, true))
    .reduce((sum, bid, i) => sum + bid.amount * (i + 1), 0)
);

console.timeEnd("Execution time");
export {};
