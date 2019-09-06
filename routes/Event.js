const express = require("express");
const router = express.Router();
const lodash = require('lodash');
const { Card } = require("../models/Card");
const mtgDecks = require('../utils/mtgDecksParser');
const scryfall = require('../utils/scryfall');
const sampleJson = require('./sampleParse');

router.put("/decks/legacy", async (req, res) => {
  // const events = await mtgDecks.fetchEvents('Legacy');
  const events = sampleJson;
  const totalCards = lodash.flatten(events.map(event => {
    return lodash.flatten(event.decks.map(deck => {
      const mdCards = deck.maindeck.map(card => card.name);
      const sbCards = deck.sideboard.map(card => card.name);
      return [...mdCards, ...sbCards];
    }))
  }));
  const chunkedCards = lodash.chunk(lodash.uniq(totalCards), 75)
  Promise.all(chunkedCards.map(cards => scryfall.fetchCardsInfo(cards)))
  .then(response => {
    const cards = lodash.flatten(response.map(resp => lodash.flatten(resp.data.map(card => ({
      id: card.id,
      name: card.name,
      tcgplayer_id: card.tcgplayer_id,
      uri: card.uri,
      set: card.set,
      set_name: card.set_name,
      related_uris: card.related_uris,
      image_uris: card.image_uris
    })))));
    events.map(event => {
      event.decks.map(deck => {
        return {
          ...deck,
          
        }
      })
    })

    // const events = 

    console.log('num cards: ', cards.length)
    res.json(cards)
  })
  
});

module.exports = router;