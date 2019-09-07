const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 200
  },
  date: {
    type: Date,
    required: true,
  },
  link: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100,
    unique: true,
  },
  format: {
    type: String,
    required: true,
  },
  stars: {
    type: Number,
    required: true,
    min: 0,
    max: 5,
  },
  players: {
    type: Number,
  },
  decks: [String],
});

const Event = mongoose.model('Event', EventSchema);

exports.Event = Event;