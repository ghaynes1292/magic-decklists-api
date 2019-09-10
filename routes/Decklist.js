const express = require("express");
const router = express.Router();
const lodash = require('lodash');

const scryfall = require('../utils/scryfall');
const { findCommonDecks } = require("../models/Deck");

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

router.post("/convert", async (req, res) => {
  const convertedDecklist = lodash.compact(convertRequestToDecklist(req.body));

  res.json(convertedDecklist);
});

router.post("/match", async (req, res) => {
  const convertedDecklist = lodash.compact(convertRequestToDecklist(req.body));
  const commonDecks = await findCommonDecks(convertedDecklist);
  const slicedDecks = lodash.orderBy(commonDecks, ['difference'], ['asc']).slice(0, 15);
  const totalCards = lodash.uniq(lodash.flatten(slicedDecks.map(deck => deck.list.map(card => card.name))));
  const cardsWithInfo = await scryfall.fetchCardsInfo(totalCards);
  const slicedDecksWithCardInfo = slicedDecks.map(deck => {
    return {
      ...deck,
      list: deck.list.map(card => ({
        ...card,
        ...lodash.find(cardsWithInfo, ['name', card.name])
      }))
    };
  })

  res.json(slicedDecksWithCardInfo);
});

module.exports = router;