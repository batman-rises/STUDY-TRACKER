import { useState } from "react";
import api from "../services/api";

const StudyEntry = () => {
  const [formData, setFormData] = useState({
    date: "",
    hours: "",
    subjects: "",
    topics: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      date: formData.date,
      hours: Number(formData.hours),
      subjects: formData.subjects
        .split(",")
        .map((subject) => subject.trim())
        .filter(Boolean),
      topics: formData.topics
        .split(",")
        .map((topic) => topic.trim())
        .filter(Boolean),
      notes: formData.notes,
    };

    try {
      setLoading(true);

      const response = await api.post("/study", data);

      console.log("Study session created:", response.data);

      alert("Study session saved!");

      setFormData({
        date: "",
        hours: "",
        subjects: "",
        topics: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error saving study session:", error);

      alert(error.response?.data?.message || "Failed to save study session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-bold uppercase tracking-wider text-green-600">
            Study Tracker
          </p>

          <h1 className="text-3xl font-bold text-slate-900">
            Log Study Session
          </h1>

          <p className="mt-2 text-slate-500">
            Record what you studied and keep track of your progress.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl bg-white p-6 shadow-lg sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date + Hours */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="date"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Date
                </label>

                <input
                  id="date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="hours"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Hours Studied
                </label>

                <input
                  id="hours"
                  type="number"
                  name="hours"
                  value={formData.hours}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  placeholder="e.g. 4.5"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Subjects */}
            <div>
              <label
                htmlFor="subjects"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Subjects
              </label>

              <input
                id="subjects"
                type="text"
                name="subjects"
                value={formData.subjects}
                onChange={handleChange}
                placeholder="DSA, AIML, Project"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-1.5 text-xs text-slate-400">
                Separate multiple subjects with commas.
              </p>
            </div>

            {/* Topics */}
            <div>
              <label
                htmlFor="topics"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Topics Studied
              </label>

              <input
                id="topics"
                type="text"
                name="topics"
                value={formData.topics}
                onChange={handleChange}
                placeholder="Sliding Window, MLE, NumPy"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-1.5 text-xs text-slate-400">
                Separate multiple topics with commas.
              </p>
            </div>

            {/* Notes */}
            <div>
              <label
                htmlFor="notes"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Notes
              </label>

              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                placeholder="How was today's study session?"
                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-1.5 text-xs text-slate-400">Optional</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Study Session"}
            </button>
          </form>
        </div>

        {/* Bottom hint */}
        <p className="mt-5 text-center text-xs text-slate-400">
          Your study sessions will be used to generate weekly, monthly and
          quarterly analytics.
        </p>
      </div>
    </div>
  );
};

export default StudyEntry;
