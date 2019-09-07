const express = require("express");
const router = express.Router();
const lodash = require('lodash');
const mtg = require('../utils/mtgTopParser');

const regex = /[,' -]/gi;

const convertRequestToDecklist = (body) => {
  return body.map((line) => {
    if (lodash.isEqual(line, 'Sideboard')) {
      return false;
    }
    const lineSplit = line.split(' ');
    const cardCount = lodash.toNumber(lineSplit[0]);
    return { count: cardCount, name: lineSplit.slice(1).join(' ') };
  })
};

const findCommonCards = (userDecklist, topDecklists) => {
  console.log(`mapping through ${topDecklists.length} decks`);
  const commonDecks = topDecklists.map((deck) => {
    const diff = lodash.differenceBy(deck.cards, userDecklist, ({ name }) => name.replace(regex, ''));
    console.log (`Deck: ${deck.title}, Diff: ${diff.length}`);
    return diff.length < 10 && { ...deck, difference: diff.length, diffCards: diff }
  })
  return lodash.compact(commonDecks);
}

router.post("/convert", async (req, res) => {
  const convertedDecklist = lodash.compact(convertRequestToDecklist(req.body));
  res.json(convertedDecklist);
});

module.exports = router;