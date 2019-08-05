const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  console.log(req.body, req)
  res.json(req.body)
});

module.exports = router;