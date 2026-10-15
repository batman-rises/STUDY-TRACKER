const express = require("express");
const mongoose = require("mongoose");

const StudySession = require("../models/StudySession");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes below require authentication.
router.use(protect);

// CREATE a study session.
router.post("/", async (req, res) => {
  try {
    const session = await StudySession.create({
      ...req.body,
      user: req.user._id,
    });

    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// READ all sessions belonging to the logged-in user.
router.get("/", async (req, res) => {
  try {
    const sessions = await StudySession.find({
      user: req.user._id,
    }).sort({ date: -1 });

    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// READ one session, but only if the user owns it.
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid study session ID.",
      });
    }

    const session = await StudySession.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        message: "Study session not found.",
      });
    }

    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// UPDATE a session belonging to the logged-in user.
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid study session ID.",
      });
    }

    // Never allow the client to change ownership.
    const { _id, user, __v, createdAt, updatedAt, ...updates } = req.body;

    const session = await StudySession.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      updates,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!session) {
      return res.status(404).json({
        message: "Study session not found.",
      });
    }

    res.status(200).json(session);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// DELETE a session belonging to the logged-in user.
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid study session ID.",
      });
    }

    const session = await StudySession.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        message: "Study session not found.",
      });
    }

    res.status(200).json({
      message: "Study session deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
