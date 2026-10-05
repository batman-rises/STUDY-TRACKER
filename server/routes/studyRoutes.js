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

router.get("/", async (req, res) => {
  try {
    const sessions = await StudySession.find().sort({ date: -1 });

    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const session = await StudySession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        message: "Study session not found",
      });
    }

    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const session = await StudySession.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!session) {
      return res.status(404).json({
        message: "Study session not found",
      });
    }

    res.status(200).json(session);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const session = await StudySession.findByIdAndDelete(req.params.id);

    if (!session) {
      return res.status(404).json({
        message: "Study session not found",
      });
    }

    res.status(200).json({
      message: "Study session deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

module.exports = router;
