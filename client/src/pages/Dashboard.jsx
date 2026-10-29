import { useEffect, useState } from "react";
import api from "../services/api";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = [
  "#2563eb",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
];

const Dashboard = () => {
  const [stats, setStats] = useState({
    today: 0,
    week: 0,
    month: 0,
    average: 0,
  });

  const [dailyHours, setDailyHours] = useState([]);
  const [subjectData, setSubjectData] = useState([]);

  const [streak, setStreak] = useState({
    currentStreak: 0,
    longestStreak: 0,
    studiedToday: false,
  });

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all dashboard analytics.
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          summaryResponse,
          dailyResponse,
          subjectResponse,
          streakResponse,
        ] = await Promise.all([
          api.get("/analytics/summary"),
          api.get("/analytics/daily-hours"),
          api.get("/analytics/subjects"),
          api.get("/analytics/streak"),
        ]);

        setStats(summaryResponse.data);
        setDailyHours(dailyResponse.data);
        setSubjectData(subjectResponse.data);
        setStreak(streakResponse.data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError("Could not load study statistics. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Generate every day of the selected month, including zero-hour days.
  const monthlyHours = (() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const hoursByDate = new Map();

    dailyHours.forEach((entry) => {
      hoursByDate.set(
        entry.date,
        (hoursByDate.get(entry.date) || 0) + Number(entry.hours || 0),
      );
    });

    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;

      const date = [
        year,
        String(month + 1).padStart(2, "0"),
        String(day).padStart(2, "0"),
      ].join("-");

      return {
        date,
        day,
        hours: hoursByDate.get(date) ?? 0,
      };
    });
  })();

  const monthLabel = selectedMonth.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const now = new Date();

  const isCurrentMonth =
    selectedMonth.getFullYear() === now.getFullYear() &&
    selectedMonth.getMonth() === now.getMonth();

  const changeMonth = (offset) => {
    setSelectedMonth((previous) => {
      const next = new Date(
        previous.getFullYear(),
        previous.getMonth() + offset,
        1,
      );

      // Do not navigate into future months.
      if (next > new Date(now.getFullYear(), now.getMonth(), 1)) {
        return previous;
      }

      return next;
    });
  };

  const StatCard = ({ title, value, unit }) => (
    <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">
        {loading ? "..." : `${value} ${unit}`}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        {/* Dashboard heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Study Tracker
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">Dashboard</h1>

          <p className="mt-2 text-slate-500">
            Track your study habits and analyze your progress.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Statistics cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Today" value={stats.today} unit="hrs" />
          <StatCard title="This Week" value={stats.week} unit="hrs" />
          <StatCard title="This Month" value={stats.month} unit="hrs" />
          <StatCard
            title="Average per Session"
            value={stats.average}
            unit="hrs"
          />
        </div>

        {/* Study streak card */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-3xl">
                🔥
              </div>

              <div>
                <p className="text-sm text-slate-500">Current Study Streak</p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {loading ? "..." : streak.currentStreak}{" "}
                  <span className="text-lg font-medium">
                    {streak.currentStreak === 1 ? "day" : "days"}
                  </span>
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {streak.studiedToday
                    ? "You've studied today. Keep it going!"
                    : streak.currentStreak > 0
                      ? "Study today to keep your streak alive!"
                      : "Record a study session to start your streak!"}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 px-5 py-4">
              <p className="text-sm text-slate-500">Longest Streak</p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {loading ? "..." : streak.longestStreak}{" "}
                <span className="text-base font-medium">days</span>
              </p>
            </div>
          </div>
        </div>

        {/* Existing charts */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Daily study hours bar chart */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Daily Study Hours
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your study time for each recorded date.
            </p>

            <div className="mt-6 h-64">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-slate-400">Loading chart...</p>
                </div>
              ) : dailyHours.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-slate-400">
                    No study sessions recorded yet.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dailyHours}
                    margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />

                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => date.slice(5)}
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      allowDecimals
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      formatter={(value) => [`${value} hours`, "Study time"]}
                      labelFormatter={(date) => `Date: ${date}`}
                    />

                    <Bar
                      dataKey="hours"
                      name="Study Hours"
                      fill="#2563eb"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={45}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Subject distribution donut chart */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Subject Distribution
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              See how your study time is distributed across subjects.
            </p>

            <div className="mt-6 h-64">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-slate-400">Loading chart...</p>
                </div>
              ) : subjectData.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-slate-400">
                    No subject data available yet.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectData}
                      dataKey="hours"
                      nameKey="subject"
                      cx="50%"
                      cy="45%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      label={({ subject, percent }) =>
                        `${subject} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {subjectData.map((entry, index) => (
                        <Cell
                          key={entry.subject}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) => [`${value} hours`, "Study time"]}
                    />

                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Monthly study hours line chart */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Monthly Study Hours
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your daily study time, including days with zero hours.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-100"
                aria-label="Previous month"
              >
                ←
              </button>

              <span className="min-w-36 text-center font-semibold text-slate-800">
                {monthLabel}
              </span>

              <button
                type="button"
                onClick={() => changeMonth(1)}
                disabled={isCurrentMonth}
                className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next month"
              >
                →
              </button>
            </div>
          </div>

          <div className="mt-6 h-80">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-slate-400">
                  Loading monthly chart...
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyHours}
                  margin={{ top: 10, right: 15, left: 5, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />

                  <XAxis
                    dataKey="day"
                    type="number"
                    domain={[1, monthlyHours.length]}
                    ticks={monthlyHours.map((entry) => entry.day)}
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                    label={{
                      value: "Date of month",
                      position: "insideBottom",
                      offset: -15,
                      fontSize: 12,
                    }}
                  />

                  <YAxis
                    type="number"
                    domain={[0, "auto"]}
                    allowDecimals
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    label={{
                      value: "Study hours",
                      angle: -90,
                      position: "insideLeft",
                      fontSize: 12,
                    }}
                  />

                  <Tooltip
                    labelFormatter={(day) => {
                      const entry = monthlyHours.find(
                        (item) => item.day === Number(day),
                      );

                      if (!entry) return `Day ${day}`;

                      return new Date(
                        `${entry.date}T00:00:00`,
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      });
                    }}
                    formatter={(value) => [`${value} hours`, "Study time"]}
                  />

                  <Line
                    type="linear"
                    dataKey="hours"
                    name="Study Hours"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#2563eb" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <p className="mt-2 text-xs text-slate-400">
            Dates without recorded study sessions are displayed as zero hours.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
