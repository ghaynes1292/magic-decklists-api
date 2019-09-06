var fetch = require('node-fetch');
var cheerio = require('cheerio');
var moment = require('moment');
var iconv = require('iconv-lite');
const lodash = require('lodash');

const fetchCardsInfo = async (cards) => {
  const cardObjects = cards.map(card => ({ name: card }));
  return fetch('https://api.scryfall.com/cards/collection', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifiers: cardObjects })
  }).then(res => res.json())
};

module.exports = {
  fetchCardsInfo
};