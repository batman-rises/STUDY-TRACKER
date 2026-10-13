// Import the StudySession model.
// This model is connected to the "studysessions" collection in MongoDB.
const StudySession = require("../models/StudySession");

// Controller function.
// This function will run when the client sends:
// GET /api/analytics/summary
const getSummary = async (req, res) => {
  try {
    // Fetch ALL study sessions from MongoDB.
    //
    // Example:
    // [
    //   { date: "2026-10-01", hours: 3 },
    //   { date: "2026-10-02", hours: 4 },
    //   { date: "2026-10-04", hours: 2 }
    // ]
    const sessions = await StudySession.find();

    // Create a Date object representing RIGHT NOW.
    //
    // Example:
    // October 5, 2026, 5:30 PM
    const now = new Date();

    // ------------------------------------------------
    // CALCULATE START OF TODAY
    // ------------------------------------------------

    // Make a copy of the current date/time.
    //
    // If now is:
    // 5 October 2026, 5:30 PM
    //
    // startOfToday initially is also:
    // 5 October 2026, 5:30 PM
    const startOfToday = new Date(now);

    // Change the time to:
    // 00:00:00.000
    //
    // So now it becomes:
    // 5 October 2026, 12:00 AM
    //
    // This gives us the beginning of today.
    startOfToday.setHours(0, 0, 0, 0);

    // ------------------------------------------------
    // CALCULATE START OF THIS WEEK
    // ------------------------------------------------

    // Again, create a copy of the current date.
    const startOfWeek = new Date(now);

    // getDay() gives the day of the week as a number:
    //
    // Sunday    = 0
    // Monday    = 1
    // Tuesday   = 2
    // Wednesday = 3
    // Thursday  = 4
    // Friday    = 5
    // Saturday  = 6
    //
    // We want our week to start on MONDAY.
    const day = startOfWeek.getDay();

    // Calculate how many days we need to go BACK
    // to reach Monday.
    //
    // Example:
    //
    // Monday    -> 1 - 1 = 0 days back
    // Tuesday   -> 2 - 1 = 1 day back
    // Wednesday -> 3 - 1 = 2 days back
    //
    // Sunday is special:
    // Sunday = 0
    //
    // We want Sunday to go back 6 days to Monday.
    //
    // Therefore:
    // Sunday -> 6
    // Otherwise -> day - 1
    const diff = day === 0 ? 6 : day - 1;

    // Move the date backwards by "diff" days.
    //
    // For example, if today is Wednesday:
    //
    // Wednesday
    //      ↓ 2 days back
    // Monday
    //
    startOfWeek.setDate(startOfWeek.getDate() - diff);

    // Set the time to midnight.
    //
    // Now startOfWeek represents:
    // Monday 00:00:00
    startOfWeek.setHours(0, 0, 0, 0);

    // ------------------------------------------------
    // CALCULATE START OF THIS MONTH
    // ------------------------------------------------

    // Create a Date representing:
    //
    // 1st day of the current month
    // at 00:00:00
    //
    // getFullYear() -> current year
    // getMonth()    -> current month
    //
    // IMPORTANT:
    // getMonth() is zero-based:
    //
    // January   = 0
    // February  = 1
    // ...
    // October   = 9
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // ------------------------------------------------
    // VARIABLES TO STORE OUR RESULTS
    // ------------------------------------------------

    // Total hours studied TODAY
    let today = 0;

    // Total hours studied THIS WEEK
    let week = 0;

    // Total hours studied THIS MONTH
    let month = 0;

    // Total hours studied EVER
    let total = 0;

    // ------------------------------------------------
    // GO THROUGH EVERY STUDY SESSION
    // ------------------------------------------------

    // forEach() runs once for every session.
    //
    // If we have 5 sessions,
    // this code runs 5 times.
    sessions.forEach((session) => {
      // Convert the session's date into a JavaScript Date object.
      //
      // Example:
      // session.date = "2026-10-04"
      //
      // sessionDate = Date object representing that date.
      const sessionDate = new Date(session.date);

      // Get the number of hours from this session.
      //
      // Example:
      // session.hours = 4
      //
      // hours = 4
      const hours = session.hours;

      // Add this session's hours to TOTAL hours.
      //
      // Example:
      //
      // total = 0
      // session = 3 hours
      // total = 3
      //
      // next session = 4 hours
      // total = 7
      total += hours;

      // ------------------------------------------------
      // CHECK IF SESSION WAS TODAY
      // ------------------------------------------------

      // If the session date is greater than or equal to
      // the beginning of today...
      //
      // Example:
      //
      // startOfToday = Oct 5, 12:00 AM
      // sessionDate  = Oct 5, 10:00 AM
      //
      // sessionDate >= startOfToday
      // TRUE
      //
      // Therefore, add its hours to today's total.
      if (sessionDate >= startOfToday) {
        today += hours;
      }

      // ------------------------------------------------
      // CHECK IF SESSION WAS THIS WEEK
      // ------------------------------------------------

      // If the session happened on or after
      // the beginning of this week...
      //
      // Example:
      //
      // startOfWeek = Monday
      // sessionDate = Tuesday
      //
      // Tuesday >= Monday
      // TRUE
      //
      // So add the hours to the weekly total.
      if (sessionDate >= startOfWeek) {
        week += hours;
      }

      // ------------------------------------------------
      // CHECK IF SESSION WAS THIS MONTH
      // ------------------------------------------------

      // If the session happened on or after
      // the first day of this month...
      //
      // Example:
      //
      // startOfMonth = October 1
      // sessionDate  = October 4
      //
      // October 4 >= October 1
      // TRUE
      //
      // Therefore add the hours to monthly total.
      if (sessionDate >= startOfMonth) {
        month += hours;
      }
    });

    // ------------------------------------------------
    // CALCULATE AVERAGE
    // ------------------------------------------------

    // Average =
    //
    // Total hours / Number of study sessions
    //
    // Example:
    //
    // 5 sessions
    // Total = 20 hours
    //
    // Average = 20 / 5
    //         = 4 hours per session
    //
    // We check sessions.length > 0 first
    // to prevent division by zero.
    const average = sessions.length > 0 ? total / sessions.length : 0;

    // ------------------------------------------------
    // SEND RESPONSE TO FRONTEND
    // ------------------------------------------------

    // Send HTTP status 200 = successful request.
    //
    // res.json() converts this JavaScript object
    // into JSON and sends it to React.
    res.status(200).json({
      // Total hours studied today
      today,

      // Total hours studied this week
      week,

      // Total hours studied this month
      month,

      // Average hours per study session
      //
      // toFixed(2) keeps only 2 decimal places.
      //
      // Example:
      // 3.666666 -> "3.67"
      //
      // Number() converts the string "3.67"
      // back into the number 3.67.
      average: Number(average.toFixed(2)),
    });
  } catch (error) {
    // If anything goes wrong:
    //
    // MongoDB error
    // Database connection error
    // Invalid data
    // etc.
    //
    // send HTTP 500 = Internal Server Error
    res.status(500).json({
      message: error.message,
    });
  }
};

const getDailyHours = async (req, res) => {
  try {
    const sessions = await StudySession.find();

    const dailyHours = {};

    sessions.forEach((session) => {
      // Convert the date into YYYY-MM-DD format.
      const date = new Date(session.date).toISOString().split("T")[0];

      // Add hours if multiple sessions share the same date.
      dailyHours[date] = (dailyHours[date] || 0) + session.hours;
    });

    // Convert the object into an array for the chart.
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

const getSubjectDistribution = async (req, res) => {
  try {
    // Fetch all study sessions from MongoDB.
    const sessions = await StudySession.find();

    // Store total hours for each subject.
    const subjectHours = {};

    sessions.forEach((session) => {
      // Get the subjects recorded in this session.
      const subjects = session.subjects;

      // Skip sessions that have no subjects.
      if (!subjects || subjects.length === 0) {
        return;
      }

      // Divide the session hours equally among its subjects.
      // Example: 2 hours across DSA and AI/ML = 1 hour each.
      const hoursPerSubject = session.hours / subjects.length;

      subjects.forEach((subject) => {
        // Add the allocated hours to this subject's total.
        subjectHours[subject] = (subjectHours[subject] || 0) + hoursPerSubject;
      });
    });

    // Convert the object into an array for Recharts.
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

// Export the function so that
// analyticsRoutes.js can use it.
module.exports = {
  getDailyHours,
  getSummary,
  getSubjectDistribution,
};
