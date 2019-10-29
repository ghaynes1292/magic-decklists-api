const express = require("express");
const router = express.Router();
const lodash = require('lodash');
var moment = require('moment');
const mtgDecks = require('../utils/mtgDecksParser');
const { Event } = require("../models/Event");
const { Deck } = require("../models/Deck");

router.put("/legacy", async (req, res) => {
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
  let newDecks = [];
  if (newEvents.length) {
    newDecks = await Promise.all(lodash.flatten(events.map(event => {
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
          event: event.link,
        });
        return tempDeck.save();
      });
      return eventDecks;
    })));
    console.log('new decks: ', newDecks.length);
  }

  res.json({
    events: newEvents.map(event => event.link),
    decks: newDecks.map(deck => deck.link)
  });
});

router.get("/legacy", async (req, res) => {
  const { playerMin = -1, mtgo = true } = req.query;
  const events = await Event.find({ $or: [ { players: { $eq: mtgo ? -1 : playerMin } }, { players: { $gte: playerMin } } ] });
  res.json(events);
});

module.exports = router;