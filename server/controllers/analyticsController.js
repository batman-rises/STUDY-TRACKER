const StudySession = require("../models/StudySession");

// Helper: fetch only the current user's sessions.
const getUserSessions = (userId) => {
  return StudySession.find({ user: userId });
};

// GET /api/analytics/summary
const getSummary = async (req, res) => {
  try {
    const sessions = await getUserSessions(req.user._id);

    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? 6 : day - 1;

    startOfWeek.setDate(startOfWeek.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let today = 0;
    let week = 0;
    let month = 0;
    let total = 0;

    sessions.forEach((session) => {
      const sessionDate = new Date(session.date);
      const hours = session.hours;

      total += hours;

      if (sessionDate >= startOfToday) today += hours;
      if (sessionDate >= startOfWeek) week += hours;
      if (sessionDate >= startOfMonth) month += hours;
    });

    const average = sessions.length > 0 ? total / sessions.length : 0;

    res.status(200).json({
      today,
      week,
      month,
      average: Number(average.toFixed(2)),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET /api/analytics/daily-hours
const getDailyHours = async (req, res) => {
  try {
    const sessions = await getUserSessions(req.user._id);

    const dailyHours = {};

    sessions.forEach((session) => {
      const date = new Date(session.date).toISOString().split("T")[0];

      dailyHours[date] = (dailyHours[date] || 0) + session.hours;
    });

    const result = Object.entries(dailyHours)
      .map(([date, hours]) => ({ date, hours }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET /api/analytics/subjects
const getSubjectDistribution = async (req, res) => {
  try {
    const sessions = await getUserSessions(req.user._id);

    const subjectHours = {};

    sessions.forEach((session) => {
      const subjects = [
        ...new Set(
          (session.subjects || [])
            .map((subject) => subject.trim())
            .filter(Boolean),
        ),
      ];

      if (subjects.length === 0) return;

      // Divide hours equally among the listed subjects.
      const hoursPerSubject = session.hours / subjects.length;

      subjects.forEach((subject) => {
        subjectHours[subject] = (subjectHours[subject] || 0) + hoursPerSubject;
      });
    });

    const result = Object.entries(subjectHours).map(([subject, hours]) => ({
      subject,
      hours: Number(hours.toFixed(2)),
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getSummary,
  getDailyHours,
  getSubjectDistribution,
};
