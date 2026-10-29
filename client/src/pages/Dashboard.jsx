import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import CherryBlossomPetals from "../components/CherryBlossomPetals";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

const COLORS = [
  "#c96f91",
  "#879b78",
  "#d9a46c",
  "#a18bc1",
  "#d98c83",
  "#7da6a0",
];

const INITIAL_STATS = {
  today: 0,
  week: 0,
  month: 0,
  average: 0,
};

const INITIAL_STREAK = {
  currentStreak: 0,
  longestStreak: 0,
  studiedToday: false,
};

const formatHours = (value) => {
  const hours = Number(value || 0);
  return Number.isInteger(hours) ? `${hours}` : hours.toFixed(2);
};

const dateKey = (year, month, day) =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const Dashboard = () => {
  const [stats, setStats] = useState(INITIAL_STATS);
  const [dailyHours, setDailyHours] = useState([]);
  const [subjectData, setSubjectData] = useState([]);
  const [streak, setStreak] = useState(INITIAL_STREAK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // The displayed month can be changed without changing the stored data.
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    let active = true;

    const fetchAnalytics = async () => {
      setLoading(true);
      setError("");

      const requests = await Promise.allSettled([
        api.get("/analytics/summary"),
        api.get("/analytics/daily-hours"),
        api.get("/analytics/subjects"),
        api.get("/analytics/streak"),
      ]);

      if (!active) return;

      const [summary, daily, subjects, streakResult] = requests;
      const failures = [];

      if (summary.status === "fulfilled") {
        setStats({ ...INITIAL_STATS, ...summary.value.data });
      } else {
        failures.push("summary");
      }

      if (daily.status === "fulfilled") {
        setDailyHours(Array.isArray(daily.value.data) ? daily.value.data : []);
      } else {
        failures.push("daily study hours");
      }

      if (subjects.status === "fulfilled") {
        setSubjectData(
          Array.isArray(subjects.value.data) ? subjects.value.data : [],
        );
      } else {
        failures.push("subject distribution");
      }

      if (streakResult.status === "fulfilled") {
        setStreak({ ...INITIAL_STREAK, ...streakResult.value.data });
      } else {
        failures.push("study streak");
      }

      if (failures.length > 0) {
        console.error("Failed analytics requests:", failures);
        setError(
          `Some statistics could not load: ${failures.join(", ")}. Check the API and try refreshing.`,
        );
      }

      setLoading(false);
    };

    fetchAnalytics();

    return () => {
      active = false;
    };
  }, []);

  // Fill every calendar day, including days with zero study hours.
  const monthlyData = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const totals = {};

    dailyHours.forEach((session) => {
      if (!session.date) return;

      const key = String(session.date).slice(0, 10);
      totals[key] = (totals[key] || 0) + Number(session.hours || 0);
    });

    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const date = dateKey(year, month, day);

      return {
        day,
        date,
        hours: Number((totals[date] || 0).toFixed(2)),
      };
    });
  }, [dailyHours, selectedMonth]);

  const monthLabel = selectedMonth.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const goToPreviousMonth = () => {
    setSelectedMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    const now = new Date();
    const nextMonth = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth() + 1,
      1,
    );
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    if (nextMonth <= currentMonth) {
      setSelectedMonth(nextMonth);
    }
  };

  const isCurrentMonth =
    selectedMonth.getFullYear() === new Date().getFullYear() &&
    selectedMonth.getMonth() === new Date().getMonth();

  const StatCard = ({ title, value, icon, description }) => (
    <div className="sakura-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-[#887c73]">{title}</p>
        <span className="text-xl" aria-hidden="true">
          {icon}
        </span>
      </div>

      <p className="mt-3 text-3xl font-bold tracking-tight text-[#453b35]">
        {loading ? "..." : formatHours(value)}
        <span className="ml-2 text-base font-medium text-[#887c73]">hrs</span>
      </p>

      {description && (
        <p className="mt-2 text-xs text-[#887c73]">{description}</p>
      )}
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 sm:py-10">
      <CherryBlossomPetals />

      <main className="relative z-0 mx-auto max-w-7xl">
        {/* Dashboard heading */}
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#a94e72]">
            春 · HARU · SPRING
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#453b35] sm:text-4xl">
            Your Study Garden <span aria-hidden="true">🌸</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#887c73] sm:text-base">
            Small steps, every day. Watch your knowledge bloom.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-[#e8c4cf] bg-[#fff0f4] p-4 text-sm text-[#91435f]"
          >
            {error}
          </div>
        )}

        {/* Summary cards */}
        <section
          aria-label="Study summary"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <StatCard title="Today" value={stats.today} icon="🌸" />
          <StatCard title="This Week" value={stats.week} icon="🌿" />
          <StatCard title="This Month" value={stats.month} icon="🌷" />
          <StatCard
            title="Average per Session"
            value={stats.average}
            icon="🍵"
          />
        </section>

        {/* Study streak */}
        <section className="sakura-card mt-6 flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-center sm:p-7">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#f9e2e8] text-3xl">
              🔥
            </div>

            <div>
              <p className="text-sm font-medium text-[#887c73]">
                Current Study Streak
              </p>

              <p className="mt-1 text-3xl font-bold text-[#453b35]">
                {loading ? "..." : streak.currentStreak}
                <span className="ml-2 text-base font-semibold">
                  {streak.currentStreak === 1 ? "day" : "days"}
                </span>
              </p>

              <p className="mt-1 text-sm text-[#71886b]">
                {streak.studiedToday
                  ? "You've studied today. Keep blooming! 🌸"
                  : streak.currentStreak > 0
                    ? "One study session today keeps your streak alive."
                    : "Record a study session to start your streak."}
              </p>
            </div>
          </div>

          <div className="min-w-36 rounded-2xl bg-[#f1f4ec] px-5 py-4">
            <p className="text-sm text-[#71886b]">Longest Streak</p>
            <p className="mt-1 text-2xl font-bold text-[#4f6950]">
              {loading ? "..." : streak.longestStreak}
              <span className="ml-2 text-sm font-semibold">
                {streak.longestStreak === 1 ? "day" : "days"}
              </span>
            </p>
          </div>
        </section>

        {/* Daily and subject charts */}
        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="sakura-card min-w-0 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-[#453b35]">
              Daily Study Hours
            </h2>
            <p className="mt-1 text-sm text-[#887c73]">
              Your study time for each recorded date.
            </p>

            <div className="mt-6 h-72">
              {loading ? (
                <ChartMessage>Growing your chart...</ChartMessage>
              ) : dailyHours.length === 0 ? (
                <ChartMessage>No study sessions recorded yet.</ChartMessage>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dailyHours}
                    margin={{ top: 10, right: 8, left: -16, bottom: 5 }}
                  >
                    <CartesianGrid
                      stroke="#eee2d9"
                      strokeDasharray="4 4"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => String(date).slice(5)}
                      tick={{ fill: "#887c73", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals
                      tick={{ fill: "#887c73", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #eee2d9",
                        background: "#fffdfa",
                      }}
                      formatter={(value) => [`${value} hours`, "Study time"]}
                      labelFormatter={(date) => `Date: ${date}`}
                    />
                    <Bar
                      dataKey="hours"
                      name="Study Hours"
                      fill="#cf7897"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={42}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="sakura-card min-w-0 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-[#453b35]">
              Subject Distribution
            </h2>
            <p className="mt-1 text-sm text-[#887c73]">
              See how your study time is distributed across subjects.
            </p>

            <div className="mt-6 h-72">
              {loading ? (
                <ChartMessage>Growing your chart...</ChartMessage>
              ) : subjectData.length === 0 ? (
                <ChartMessage>No subject data available yet.</ChartMessage>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectData}
                      dataKey="hours"
                      nameKey="subject"
                      cx="50%"
                      cy="45%"
                      innerRadius={52}
                      outerRadius={88}
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
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #eee2d9",
                        background: "#fffdfa",
                      }}
                      formatter={(value) => [`${value} hours`, "Study time"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </section>

        {/* Full monthly frequency-style line graph */}
        <section className="sakura-card mt-6 p-5 sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[#a94e72]">
                Your monthly progress
              </p>
              <h2 className="mt-1 text-xl font-bold text-[#453b35]">
                Monthly Study Hours
              </h2>
              <p className="mt-1 text-sm text-[#887c73]">
                Every day is included, even when you study zero hours.
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <button
                type="button"
                className="sakura-button-secondary"
                onClick={goToPreviousMonth}
                aria-label="Previous month"
              >
                ←
              </button>

              <span className="min-w-36 text-center text-sm font-semibold text-[#453b35]">
                {monthLabel}
              </span>

              <button
                type="button"
                className="sakura-button-secondary disabled:cursor-not-allowed disabled:opacity-40"
                onClick={goToNextMonth}
                disabled={isCurrentMonth}
                aria-label="Next month"
              >
                →
              </button>
            </div>
          </div>

          <div className="mt-7 h-80 w-full">
            {loading ? (
              <ChartMessage>Growing your monthly chart...</ChartMessage>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyData}
                  margin={{ top: 12, right: 12, left: 0, bottom: 8 }}
                >
                  <CartesianGrid
                    stroke="#eee2d9"
                    strokeDasharray="4 4"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    type="number"
                    domain={[1, "dataMax"]}
                    allowDecimals={false}
                    tick={{ fill: "#887c73", fontSize: 11 }}
                    axisLine={{ stroke: "#e6d8cf" }}
                    tickLine={false}
                    interval={Math.max(
                      0,
                      Math.ceil(monthlyData.length / 15) - 1,
                    )}
                    label={{
                      value: "Date of month",
                      position: "insideBottom",
                      offset: -2,
                      fill: "#887c73",
                      fontSize: 12,
                    }}
                  />
                  <YAxis
                    allowDecimals
                    domain={[0, "auto"]}
                    tick={{ fill: "#887c73", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={44}
                    label={{
                      value: "Study hours",
                      angle: -90,
                      position: "insideLeft",
                      fill: "#887c73",
                      fontSize: 12,
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #eee2d9",
                      background: "#fffdfa",
                    }}
                    labelFormatter={(day) =>
                      `${selectedMonth.toLocaleDateString("en-IN", {
                        month: "short",
                        year: "numeric",
                      })} · ${day}`
                    }
                    formatter={(value) => [`${value} hours`, "Study time"]}
                  />
                  <Line
                    type="linear"
                    dataKey="hours"
                    name="Study Hours"
                    stroke="#c96f91"
                    strokeWidth={2.5}
                    dot={{
                      r: 3.5,
                      fill: "#c96f91",
                      stroke: "#fffdfa",
                      strokeWidth: 1.5,
                    }}
                    activeDot={{ r: 6, fill: "#a94e72" }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <p className="mt-3 text-xs text-[#887c73]">
            Tip: hover over a point to see the study hours for that date.
          </p>
        </section>

        <footer className="py-8 text-center text-sm text-[#9b8d81]">
          Made with care, one day at a time <span aria-hidden="true">🌸</span>
        </footer>
      </main>
    </div>
  );
};

const ChartMessage = ({ children }) => (
  <div className="flex h-full items-center justify-center text-sm text-[#887c73]">
    {children}
  </div>
);

export default Dashboard;
