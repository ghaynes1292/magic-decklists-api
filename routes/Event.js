const express = require("express");
const router = express.Router();
const lodash = require('lodash');
const mtg = require('../utils/mtgTopParser');

router.put("/legacy", async (req, res) => {
  Promise.all([1].map(index => mtg.fetchLegacyEvents(index)))
  .then((fetchEventsReponse) => {
    const events = lodash.flatten(fetchEventsReponse);
    Promise.all(events.map((event) => mtg.fetchEvent(event.id)))
    .then((fetchEventInfoResponse) => {
      res.json(fetchEventInfoResponse)
    })
  })
});

module.exports = router;