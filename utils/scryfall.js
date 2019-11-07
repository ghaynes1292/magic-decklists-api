var fetch = require('node-fetch');
var cheerio = require('cheerio');
var moment = require('moment');
var iconv = require('iconv-lite');
const lodash = require('lodash');

const fetchCards = async (cards) => {
  const cardObjects = cards.map(card => ({ name: card }));
  return fetch('https://api.scryfall.com/cards/collection', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifiers: cardObjects })
  }).then(res => res.json())
};

const fetchCardsInfo = (totalCards) => {
  const chunkedCards = lodash.chunk(lodash.uniq(totalCards), 75)
  return Promise.all(chunkedCards.map(cards => fetchCards(cards)))
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

    console.log('scryfall fetched cards length: ', cards.length)
    return cards
  })
};

module.exports = {
  fetchCardsInfo,
  fetchCards
};