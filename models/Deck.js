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
  player_name: {
    type: String,
    required: true,
  },
  player_link: {
    type: String,
    required: true,
  },
  ranking: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 6
  },
  format: {
    type: String,
    required: true,
  },
  format_link: {
    type: String,
    required: true,
  },
  maindeck: [Number],
  sideboard: [Number],
});

const Deck = mongoose.model('Deck', DeckSchema);

exports.Deck = Deck;