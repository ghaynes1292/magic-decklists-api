const express = require("express");
const router = express.Router();
const lodash = require('lodash');

const { Deck } = require("../models/Deck");
const { convertRequestToDecklist } = require('../utils/decklist');

router.post("/convert", async (req, res) => {
  const convertedDecklist = lodash.compact(convertRequestToDecklist(req.body));

  res.json(convertedDecklist);
});

router.get("/", async (req, res) => {
  const { link } = req.query;
  const deck = await Deck.findOne({ link });
  res.json(deck);
});

module.exports = router;