const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
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
});

const Deck = mongoose.model('Deck', DeckSchema);

exports.Deck = Deck;