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

router.post("/", async (req, res) => {
  const convertedDecklist = lodash.compact(convertRequestToDecklist(req.body));
  mtg.legacyEvents(function (err, events) {
    const allEvents = lodash.slice(events, 0, 2).map((event) => {
      return new Promise((resolve, reject) => {
        mtg.event(event.id, function (err, eventData) {
          resolve(eventData.decks);
        })
      });
    })
    Promise.all(allEvents).then((response) => {
      const commonDecks = findCommonCards(convertedDecklist, lodash.flatten(response));
      res.json(commonDecks)
    })
  });
});

// router.get("/recent", async (req, res) => {
  
// });

router.put("/legacy", async (req, res) => {
  mtg.legacyEvents(function (err, events) {
    const allEvents = lodash.map((event) => {
      return new Promise((resolve, reject) => {
        mtg.event(event.id, function (err, eventData) {
          resolve(eventData.decks);
        })
      });
    })
    Promise.all(allEvents).then((response) => {
      res.json(response)
    })
  });
});

module.exports = router;