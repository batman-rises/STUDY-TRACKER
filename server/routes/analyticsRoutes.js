const express = require("express");

const {
  getSummary,
  getDailyHours,
  getSubjectDistribution,
  getStudyStreak,
} = require("../controllers/analyticsController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/summary", getSummary);
router.get("/daily-hours", getDailyHours);
router.get("/subjects", getSubjectDistribution);
router.get("/streak", getStudyStreak);

module.exports = router;
