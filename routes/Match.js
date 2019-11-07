const express = require("express");
const router = express.Router();
const lodash = require('lodash');

const { findCommonDecksFromDeck, findCommonDecksFromCollection } = require("../models/Deck");
const scryfall = require('../utils/scryfall');
const { convertRequestToDecklist } = require('../utils/decklist');

router.post("/decklist", async (req, res) => {
  const convertedDecklist = lodash.compact(convertRequestToDecklist(req.body));
  const commonDecks = await findCommonDecksFromDeck(convertedDecklist);
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

router.post("/collection", async (req, res) => {
  const convertedDecklist = lodash.compact(convertRequestToDecklist(req.body));
  const commonDecks = await findCommonDecksFromCollection(convertedDecklist);
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