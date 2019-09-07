var req = require('request');
var cheerio = require('cheerio');
var moment = require('moment');
var iconv = require('iconv-lite');
const lodash = require('lodash');

req = req.defaults({
  encoding: null
});

var fetchDeck = async (eventId, deckId) => {
  return new Promise((resolve, reject) => {
    return req('http://mtgtop8.com/event?e=' + eventId + '&d=' + deckId, function (err, res) {
      if (err) return reject(err);

      var $ = cheerio.load(iconv.decode(res.body, 'latin-1'));
      var result = {
        player: $('table .chosen_tr [align=right] .topic').text().trim(),
        result: $('table .chosen_tr [align=center]').text().trim(),
        cards: [],
        sideboard: []
      };

      var addCards = function (arr) {
        return function (i, card) {
          var parent = $(card).parent();
          $(card).remove();

          var name = $(card).text().trim();
          var count = parseInt($(parent).text().trim());
          arr.push({
            count: count,
            name: name
          });
        }
      };

      var tables = $('table table table');
      $('tr td div span', tables.last()).each(addCards(result.sideboard));
      tables.slice(0, -1).each(function (i, table) {
        $('tr td div span', table).each(addCards(result.cards));
      });

      // An check to make sure that it's being noticed if a deck is empty. Not too sure that the method above is always working for older data.
      if (!result.cards.length) console.log('[mtgtop8] It appears that this deck is empty, should be investigated. .event(' + eventId + ',' + deckId + ')');

      resolve(result)
    });
  })
};

var fetchEventInfo = async (eventId) => {
  console.log('fetching event info id:', eventId)
  return new Promise((resolve, reject) => {
    req('http://mtgtop8.com/event?e=' + eventId, async (err, res) => {
      if (err) return reject(err);

      var $ = cheerio.load(iconv.decode(res.body, 'latin-1'));

      var players;
      var date;
      var data = lodash.get($('table div table td[align=center] div'), '[1].prev.data', '').trim();
      var playersRE = /^(\d*) players/;
      var dateRE = /(\d\d\/\d\d\/\d\d)$/;
      if (data.match(playersRE)) players = parseInt(data.match(playersRE)[1]);
      if (data.match(dateRE)) date = data.match(dateRE)[1];

      var result = {
        title: $('.w_title td').first().text(),
        format: $('table div table td[align=center] div')[0].prev.data.trim(),
        stars: $('table div table td[align=center] div img[src="graph/star.png"]').length,
        bigStars: $('table div table td[align=center] div img[src="graph/bigstar.png"]').length,
        players: players,
        date: moment(date, 'DD/MM/YY').toDate(),
        id: eventId,
        decks: []
      };
      var deckPromises = [];
      $('table td[width="25%"] > div > div:not([align="center"])').each((i, div) => {
        var link = $($('div div a', div)[0]).attr('href');
        deckPromises.push(
          fetchDeck(eventId, parseInt(link.match(/\&d\=(\d*)/)[1]))
          .then((deck) => ({
            result: $('div div[align=center]', div).text().trim(),
            title: $($('div div a', div)[0]).text().trim(),
            player: $($('div div a', div)[1]).text().trim(),
            id: parseInt(link.match(/\&d\=(\d*)/)[1]),
            maindeck: deck.cards,
            sideboard: deck.sideboard
          }))
        );
      });
      const decks = await Promise.all(deckPromises);
      console.log('decks', decks)
      resolve({
        ...result,
        decks
      })
    });
  })
};

var fetchEvent = (eventId) => {
  console.log('fetching event id:', eventId)
  return new Promise((resolve, reject) => {
    fetchEventInfo(eventId)
    .then(event => resolve(event))
    .catch(err => reject(err))
  })
};

const searchForm = (page) => ({
  form: {
    'current_page': page,
    format: 'LE',
    'compet_check[P]': 1,
    'compet_check[M]': 1,
    'compet_check[C]': 1,
  }
})

var fetchCompetetiveDecksLegacy = (page = 1) => {
  return new Promise((resolve, reject) => {
    req.post('https://www.mtgtop8.com/search', searchForm(page), (error, response) => {
      if (err) return reject(error);

      var result = [];

      var $ = cheerio.load(iconv.decode(response.body, 'latin-1'));
      
      var table = $('div div table[width="100%"] tr td[width="75%"] form > table');

      $('tr[class=hover_tr]', table).each(function (i, div) {

        const deckName = $('td[class=S11] a', div).text();
        const deckLink = $('td[class=S11] a', div).attr('href');
        const playerName = $('td[class=G11] a', div).text();
        const stars = $('td[class=O16] img[src="graph/star.png"]', div).length;
        const eventId = parseInt(deckLink.match(/e\=(\d*)/)[1]);
        const deckId = parseInt(deckLink.match(/d\=(\d*)/)[1]);

        result.push({
          deckName,
          deckLink,
          playerName,
          stars,
          eventId,
          deckId
        });
      });
      return resolve(result);
    })
  })
}

var fetchLegacyEvents = (page = 1) => {
  return new Promise((resolve, reject) => {
    req.post('http://mtgtop8.com/format?f=LE&meta=27', { form: { cp: page } }, function (err, res) {
      if (err) return reject(error);

      var result = [];

      var $ = cheerio.load(iconv.decode(res.body, 'latin-1'));

      var table = $('div div table tr td[width="40%"] > table').eq(1);
      $('tr[height="30"]', table).each(function (i, div) {
        var link = $('td a', div).attr('href');
        var date = $('td[align="right"]', div).text();

        result.push({
          title: $('td a', div).text(),
          id: parseInt(link.match(/e\=(\d*)/)[1]),
          stars: $('td[width="15%"] img[src="graph/star.png"]', div).length,
          bigstars: $('td[width="15%"] img[src="graph/bigstar.png"]', div).length,
          date: moment(date, 'DD/MM/YY').toDate()
        });
      });
      return resolve(result);
    })
  })
}

module.exports = {
  fetchLegacyEvents,
  eventInfo: fetchEventInfo,
  fetchEvent,
  fetchDeck,
};