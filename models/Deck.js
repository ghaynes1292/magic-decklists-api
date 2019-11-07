const config = require('config');
const lodash = require('lodash');
const mongoose = require('mongoose');

const DeckSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
  },
  link: {
    type: String,
    required: true,
    unique: true
  },
  archetype_link: {
    type: String,
  },
  player_name: {
    type: String,
  },
  player_link: {
    type: String,
  },
  ranking: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 15
  },
  format: {
    type: String,
    required: true,
  },
  format_link: {
    type: String,
    required: true,
  },
  maindeck: [{
    count: Number,
    name: String,
  }],
  sideboard: [{
    count: Number,
    name: String,
  }],
  event: {
    type: String,
    required: true,
  },
});

const Deck = mongoose.model('Deck', DeckSchema);

const fullDeckList = (deck) => {
  const decklist = lodash.reduce(deck, function(result, value) {
    const { name, count } = value;
    if (result[name]) {
      result[name] = result[name] + count;
    } else {
      result[name] = count;
    }
    return result;
  }, {});

  return lodash.map(decklist, (value, key) => ({
    count: value,
    name: key
  }));
};


const findCommonCards = (userDeck, savedDeck, differenceFunction) => {
  const userFullDeck = fullDeckList(userDeck);
  const savedFullDeck = fullDeckList([...savedDeck.maindeck, ...savedDeck.sideboard]);
  const differenceList = savedFullDeck.map(card => {
    const userDeckCard = lodash.find(userFullDeck, ['name', card.name])
    const userCardCount = userDeckCard ? userDeckCard.count : 0
    return {
      name: card.name,
      count: card.count - userCardCount, // Do this order because, if you need more = positive
    }
  });

  return {
    difference: differenceFunction(differenceList),
    link: savedDeck.link,
    ranking: savedDeck.ranking,
    event: savedDeck.event,
    list: differenceList
  }
};

const findCommon = (differenceFunction) => async (cards) => {
  const matchingDecks = await Deck.find({ maindeck: { $elemMatch: { name: { $in: cards.map(card => card.name) } } } });

  return lodash.orderBy(matchingDecks.map(deck => findCommonCards(cards, deck, differenceFunction)), 'difference', 'asc')
};

const differenceAbs = (differenceList) => lodash.reduce(differenceList, function(sum, n) {
  return sum + Math.abs(n.count);
}, 0);

const differenceMax = (differenceList) => lodash.reduce(differenceList, function(sum, n) {
  return sum + Math.max(n.count, 0);
}, 0);

exports.Deck = Deck;
exports.findCommonDecksFromDeck = findCommon(differenceAbs);
exports.findCommonDecksFromCollection = findCommon(differenceMax);