import { useEffect, useState } from "react";
import api from "../services/api";

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
} from "recharts";

// Colors used for different subjects in the donut chart.
const COLORS = [
  "#2563eb",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
];

const Dashboard = () => {
  // Summary statistics received from the backend.
  const [stats, setStats] = useState({
    today: 0,
    week: 0,
    month: 0,
    average: 0,
  });

  // Data for the daily study hours bar chart.
  const [dailyHours, setDailyHours] = useState([]);

  // Data for the subject distribution donut chart.
  const [subjectData, setSubjectData] = useState([]);

  // Loading and error states.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch analytics when the dashboard loads.
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch summary statistics.
        const summaryResponse = await api.get("/analytics/summary");
        setStats(summaryResponse.data);

        // Fetch daily study hours.
        const dailyResponse = await api.get("/analytics/daily-hours");
        setDailyHours(dailyResponse.data);

        // Fetch subject-wise study hours.
        const subjectResponse = await api.get("/analytics/subjects");
        setSubjectData(subjectResponse.data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError("Could not load study statistics. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Reusable card for displaying statistics.
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

        {/* Display API errors */}
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

        {/* Charts section */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Daily Study Hours bar chart */}
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
                    margin={{
                      top: 10,
                      right: 10,
                      left: -15,
                      bottom: 5,
                    }}
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
                      allowDecimals={true}
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

          {/* Subject Distribution donut chart */}
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
      </div>
    </div>
  );
};

export default Dashboard;
