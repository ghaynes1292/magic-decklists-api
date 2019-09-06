var req = require('request');
var cheerio = require('cheerio');
var moment = require('moment');
var iconv = require('iconv-lite');
const lodash = require('lodash');

req = req.defaults({
  encoding: null
});

var fetchDeck = async (deckLink, eventLink) => {
  return new Promise((resolve, reject) => {
    console.log('fetching deck: ', deckLink)
    return req(`https://mtgdecks.net/${deckLink}`, (err, res) => {
      if (err) return reject(err);

      var $ = cheerio.load(iconv.decode(res.body, 'latin-1'));
      var maindeck = [];
      var maindeckCount = 0;
      var sideboard = [];
      var sideboardCount = 0;

      const sideboardTable = $('table').has('.Sideboard');
      const mainDeckTables = $('table tr th').not('.Sideboard').parent().parent();
      const playerDeckInfo = $('div[class=row] div[class=col-md-12] div[style="padding-bottom: 5px;"]');

      $('tr[class=cardItem]', mainDeckTables).each((i, div) => {
        const count = lodash.parseInt($($('td', div)[0]).text().trim().replace('\n', '').match(/\d/)[0]);
        const name = $($('td a', div)).text()
        const card = { count, name };
        maindeckCount = maindeckCount + count;
        maindeck.push(card)
      });
      $('tr[class=cardItem]', sideboardTable).each((i, div) => {
        const count = lodash.parseInt($($('td', div)[0]).text().trim().replace('\n', '').match(/\d/)[0]);
        const name = $($('td a', div)).text()
        const card = { count, name };
        sideboardCount = sideboardCount + count;
        sideboard.push(card)
      });

      const format = $($('a', playerDeckInfo)[0]).text();
      const format_link = $($('a', playerDeckInfo)[0]).attr('href');
      const name = $($('a', playerDeckInfo)[1]).text();
      const link = $($('a', playerDeckInfo)[1]).attr('href');
      const player_name = $($('a', playerDeckInfo)[3]).text().trim();
      const player_link = $($('a', playerDeckInfo)[3]).attr('href');

      resolve({
        maindeck,
        sideboard,
        format,
        format_link,
        name,
        link,
        eventLink,
        player_name,
        player_link,
      })
    });
  })
};

var fetchEventDecks = async (eventLink) => {
  return new Promise((resolve, reject) => {
    console.log('fetching decks for: ', eventLink)
    return req(`https://mtgdecks.net${eventLink}`, (err, res) => {
      if (err) return reject(err);

      var $ = cheerio.load(iconv.decode(res.body, 'latin-1'));
      var decks = [];
      var deckCount = 0;

      const eventTable = $('table[class="clickable table table-striped"]');

      $('tr', eventTable).each((i, div) => {
        if (i == 0) return null;
        const ranking = $($('td', div)[0]).text();
        const name = $('a', $('td', div)[1]).text();
        const link = $('a', $('td', div)[1]).attr('href');
        const deck = { ranking, name, link };
        deckCount = deckCount + 1;
        decks.push(deck)
      });
      console.log('deck count', deckCount)
      Promise.all(
        decks.map(deck => fetchDeck(deck.link, eventLink).then(fetchedDeck => ({ ...deck, ...fetchedDeck })))
      ).then(decks => resolve(decks))
    });
  })
};

var fetchEvents = async (format, page) => {
  return new Promise(async (resolve, reject) => {
    console.log('fetching events for: ', format)
    return req(`https://mtgdecks.net/${format}/tournaments`, async (err, res) => {
      if (err) return reject(err);

      var $ = cheerio.load(iconv.decode(res.body, 'latin-1'));
      var fetchedEvents = [];
      var eventCount = 0;
 
      const eventTable = $('table[class="clickable table table-striped"]');

      $('tr', eventTable).each((i, div) => {
        if (i == 0) return null;
        const date = moment($('strong', $('td', div)[0]).text(), 'DD-MMM').toDate();
        const name = $('a', $('td', div)[1]).text();
        const link = $('a', $('td', div)[1]).attr('href');;
        const players = lodash.parseInt($($('td', div)[2]).text().trim().replace(' Players'));
        const stars = $('div', $('td', div)[3]).children('.glyphicon-star').length;
        const event = { date, name, link, players, format, stars };
        eventCount = eventCount + 1;
        fetchedEvents.push(event)
      });
      console.log('event count', eventCount)
      Promise.all(fetchedEvents.map((event) =>
        fetchEventDecks(event.link).then(decks => ({
          ...event,
          decks
        }))
      ))
      .then(events => resolve(events))
    });
  })
};

module.exports = {
  fetchDeck,
  fetchEventDecks,
  fetchEvents,
};