const config = require('config');
const lodash = require('lodash');
const mongoose = require('mongoose');

const DeckSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
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


const findCommonCards = (userDeck, savedDeck) => {
  const userFullDeck = fullDeckList(userDeck);
  const savedFullDeck = fullDeckList([...savedDeck.maindeck, ...savedDeck.sideboard]);
  const differenceList = userFullDeck.map(card => {
    const savedDeckCard = lodash.find(savedFullDeck, ['name', card.name])
    if (savedDeckCard) {
      return {
        name: card.name,
        count: Math.abs(card.count - savedDeckCard.count)
      }
    }
    return card;
  });
  
  const difference = lodash.reduce(differenceList, function(sum, n) {
    return sum + n.count;
  }, 0);

  return {
    difference,
    link: savedDeck.link,
    ranking: savedDeck.ranking,
    event: savedDeck.event,
    list: differenceList
  }
};

const findCommon = async (cards) => {
  const matchingDecks = await Deck.find({ maindeck: { $elemMatch: { name: { $in: cards.map(card => card.name) } } } });

  return matchingDecks.map(deck => findCommonCards(cards, deck))
};



exports.Deck = Deck;
exports.findCommonDecks = findCommon;