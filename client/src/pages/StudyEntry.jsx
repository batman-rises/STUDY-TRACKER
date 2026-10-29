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
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

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

      await api.post("/study", data);

      setMessage("success");

      setFormData({
        date: "",
        hours: "",
        subjects: "",
        topics: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error saving study session:", error);
      setMessage(
        error.response?.data?.message || "Failed to save study session.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[#e6d8cf] bg-white px-4 py-3 text-[#453b35] outline-none transition placeholder:text-[#b5a79e] focus:border-[#cf7897] focus:ring-4 focus:ring-[#f7dce6]/60";

  const labelClass = "mb-2 block text-sm font-semibold text-[#594b43]";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fbf7f0] px-4 py-10 sm:py-14">
      {/* Soft cherry blossom background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#f7dce6]/60 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-[#dce7d3]/60 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-[#f0d4df] bg-[#f9e2e8] text-3xl shadow-sm">
            🌸
          </div>

          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#a94e72]">
            Your little study garden
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#453b35] sm:text-4xl">
            Log Study Session
          </h1>

          <p className="mx-auto mt-3 max-w-md leading-relaxed text-[#887c73]">
            Every hour you invest is a seed for tomorrow's growth.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-3xl border border-[#eee2d9] bg-[#fffdfa]/95 p-6 shadow-[0_12px_40px_rgba(91,68,55,0.08)] backdrop-blur-sm sm:p-9">
          <div className="mb-7 flex items-center gap-3 border-b border-[#eee2d9] pb-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7eedf] text-xl">
              🌿
            </span>
            <div>
              <h2 className="font-bold text-[#453b35]">Today's progress</h2>
              <p className="text-sm text-[#887c73]">
                Fill in the details of your session.
              </p>
            </div>
          </div>

          {message && (
            <div
              role="status"
              className={`mb-6 rounded-xl border p-4 text-sm ${
                message === "success"
                  ? "border-[#cbdcc2] bg-[#f0f6eb] text-[#55734d]"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message === "success"
                ? "🌸 Study session saved successfully. Keep growing!"
                : message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date and hours */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="date" className={labelClass}>
                  Study date
                </label>
                <input
                  id="date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="hours" className={labelClass}>
                  Hours studied
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
                  className={inputClass}
                />
              </div>
            </div>

            {/* Subjects */}
            <div>
              <label htmlFor="subjects" className={labelClass}>
                Subjects
              </label>
              <input
                id="subjects"
                type="text"
                name="subjects"
                value={formData.subjects}
                onChange={handleChange}
                placeholder="DSA, AI/ML, Project"
                required
                className={inputClass}
              />
              <p className="mt-2 text-xs text-[#9b8d82]">
                Separate multiple subjects with commas.
              </p>
            </div>

            {/* Topics */}
            <div>
              <label htmlFor="topics" className={labelClass}>
                Topics studied
              </label>
              <input
                id="topics"
                type="text"
                name="topics"
                value={formData.topics}
                onChange={handleChange}
                placeholder="Sliding Window, MLE, NumPy"
                required
                className={inputClass}
              />
              <p className="mt-2 text-xs text-[#9b8d82]">
                Separate multiple topics with commas.
              </p>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className={labelClass}>
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder="What did you learn? What went well today?"
                className={`${inputClass} resize-y`}
              />
              <p className="mt-2 text-xs text-[#9b8d82]">
                Optional — capture a thought worth remembering.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#cf7897] px-4 py-3.5 font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#b86182] hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#f7dce6] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving your progress..." : "Save Study Session"}
              {!loading && (
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm leading-relaxed text-[#887c73]">
          🌱 Small steps every day lead to beautiful growth.
        </p>
      </div>
    </div>
  );
};

export default StudyEntry;
