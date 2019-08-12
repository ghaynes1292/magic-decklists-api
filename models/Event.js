const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

//simple schema
const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },
  id: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
});


const Event = mongoose.model('Event', EventSchema);


exports.Event = Event;