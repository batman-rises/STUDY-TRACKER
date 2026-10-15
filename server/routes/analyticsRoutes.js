const express = require("express");

const {
  getSummary,
  getDailyHours,
  getSubjectDistribution,
} = require("../controllers/analyticsController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All analytics require a valid login.
router.use(protect);

router.get("/summary", getSummary);
router.get("/daily-hours", getDailyHours);
router.get("/subjects", getSubjectDistribution);

module.exports = router;
