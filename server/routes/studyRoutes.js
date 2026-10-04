const express = require("express");
const StudySession = require("../models/StudySession.js");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const session = await StudySession.create(req.body);
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

module.exports = router;
