const StudySession = require("../models/StudySession");

// Fetch only the current user's sessions.
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

const getStudyStreak = async (req, res) => {
  try {
    const sessions = await getUserSessions(req.user._id);

    // Use Indian dates consistently, even if the server runs in UTC.
    const getDateKey = (date) =>
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(date));

    // Keep only dates on which the user actually studied.
    const uniqueDates = [
      ...new Set(
        sessions
          .filter((session) => session.hours > 0)
          .map((session) => getDateKey(session.date)),
      ),
    ].sort();

    const dateSet = new Set(uniqueDates);
    const today = getDateKey(new Date());

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = getDateKey(yesterdayDate);

    const studiedToday = dateSet.has(today);

    // If today isn't completed yet, yesterday can still anchor the streak.
    let currentStreak = 0;
    let cursor = studiedToday ? today : yesterday;

    while (dateSet.has(cursor)) {
      currentStreak++;

      const previousDate = new Date(`${cursor}T12:00:00+05:30`);
      previousDate.setDate(previousDate.getDate() - 1);
      cursor = getDateKey(previousDate);
    }

    // Find the longest consecutive run in the user's history.
    let longestStreak = 0;
    let runningStreak = 0;
    let previousDate = null;

    for (const date of uniqueDates) {
      const currentDate = new Date(`${date}T12:00:00+05:30`);

      const difference = previousDate
        ? Math.round(
            (currentDate.getTime() - previousDate.getTime()) /
              (24 * 60 * 60 * 1000),
          )
        : null;

      runningStreak = difference === 1 ? runningStreak + 1 : 1;

      longestStreak = Math.max(longestStreak, runningStreak);
      previousDate = currentDate;
    }

    res.status(200).json({
      currentStreak,
      longestStreak,
      studiedToday,
    });
  } catch (error) {
    console.error("Error calculating study streak:", error);

    res.status(500).json({
      message: "Could not calculate study streak.",
    });
  }
};

module.exports = {
  getSummary,
  getDailyHours,
  getSubjectDistribution,
  getStudyStreak,
};
