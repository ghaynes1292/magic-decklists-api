const express = require("express");
const router = express.Router();
const lodash = require('lodash');
var moment = require('moment');
const mtgDecks = require('../utils/mtgDecksParser');
const scryfall = require('../utils/scryfall');
const sampleJson = require('./sampleParse');
const { Event } = require("../models/Event");
const { Deck } = require("../models/Deck");

router.put("/decks/legacy", async (req, res) => {
  const events = await mtgDecks.fetchEvents('Legacy');
  const newEvents = await Promise.all(lodash.compact(events).map(event => {
    const tempEvent = new Event({
      name: event.name,
      date: moment(event.date).toDate(),
      link: event.link,
      format: event.format,
      stars: event.stars,
      players: event.players,
      decks: event.decks.map(deck => deck.link),
    });
    return tempEvent.save();
  }));
  console.log('new events: ', newEvents.length);
  const newDecks = await Promise.all(lodash.flatten(events.map(event => {
    const eventDecks = event.decks.map(deck => {
      const tempDeck = new Deck({
        name: deck.name,
        link: deck.link,
        archetype_link: deck.archetype_link,
        player_name: deck.player_name,
        player_link: deck.player_link,
        ranking: deck.ranking,
        format: deck.format,
        format_link: deck.format_link,
        maindeck: deck.maindeck,
        sideboard: deck.sideboard,
      });
      return tempDeck.save();
    });
    return eventDecks;
  })));
  console.log('new decks: ', newDecks.length);

  // const events = sampleJson;
  // const totalCards = lodash.flatten(events.map(event => {
  //   return lodash.flatten(event.decks.map(deck => {
  //     const mdCards = deck.maindeck.map(card => card.name);
  //     const sbCards = deck.sideboard.map(card => card.name);
  //     return [...mdCards, ...sbCards];
  //   }))
  // }));
  // const cardsInfo = await scryfall.fetchCardsInfo(totalCards);
  res.json({
    events: newEvents.map(event => event.link),
    decks: newDecks.map(deck => deck.link)
  });
});

module.exports = router;