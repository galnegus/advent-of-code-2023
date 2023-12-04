console.time("Execution time");

const testInput = false;
const rawInput: string = require("fs").readFileSync(
  require("path").resolve(__dirname, testInput ? "test" : "input"),
  "utf-8"
);

interface Card {
  index: number;
  nMatchingNumbers: number;
  points: number;
}

function parseNumbers(numbersString: string): Array<number> {
  return numbersString
    .trim()
    .split(/\s+/)
    .map((num) => Number.parseInt(num, 10));
}

const cards = rawInput
  .split(/\r?\n/)
  .filter(Boolean)
  .map<Card>((line, index) => {
    const split = line.split(": ")[1].split(" | ");
    const winningNumbers = new Set(parseNumbers(split[0]));
    const numbersYouHave = parseNumbers(split[1]);
    const nMatchingNumbers = numbersYouHave.reduce(
      (sum, numberYouHave) => sum + (winningNumbers.has(numberYouHave) ? 1 : 0),
      0
    );
    return {
      index,
      nMatchingNumbers,
      points: nMatchingNumbers && 2 ** (nMatchingNumbers - 1),
    };
  });

function wonCardsIndices(cards: Array<Card>, cardIndex?: number): Array<number> {
  if (cardIndex == null) throw new Error("cardIndex should not be nullish");
  return new Array(cards[cardIndex].nMatchingNumbers)
    .fill(undefined)
    .map((_, i) => cardIndex + i + 1)
    .filter((i) => i < cards.length)
    .map((i) => i);
}

const cardCounts: Array<number> = new Array(cards.length).fill(1);
for (let i = 0; i < cardCounts.length; ++i) {
  for (const wonCardsIndex of wonCardsIndices(cards, i)) {
    cardCounts[wonCardsIndex] += cardCounts[i];
  }
}

console.log(
  "Part 1:",
  cards.reduce((sum, card) => sum + card.points, 0)
);
console.log(
  "Part 2:",
  cardCounts.reduce((sum, card) => sum + card, 0)
);

console.timeEnd("Execution time");
export {};
