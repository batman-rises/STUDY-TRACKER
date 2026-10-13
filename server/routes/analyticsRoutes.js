const express = require("express");

const {
  getSummary,
  getDailyHours,
  getSubjectDistribution,
} = require("../controllers/analyticsController");

const router = express.Router();

router.get("/summary", getSummary);
router.get("/daily-hours", getDailyHours);
router.get("/subjects", getSubjectDistribution);

module.exports = router;
