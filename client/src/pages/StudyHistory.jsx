import { useEffect, useState } from "react";
import api from "../services/api";

const StudyHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    date: "",
    hours: "",
    subjects: "",
    topics: "",
    notes: "",
  });

  const fetchSessions = async () => {
    try {
      setError("");
      const response = await api.get("/study");
      setSessions(response.data);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError("Could not load study history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleEdit = (session) => {
    setEditingId(session._id);

    setFormData({
      date: new Date(session.date).toISOString().split("T")[0],
      hours: String(session.hours),
      subjects: (session.subjects || []).join(", "),
      topics: (session.topics || []).join(", "),
      notes: session.notes || "",
    });

    setError("");
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const hours = Number(formData.hours);

    if (!Number.isFinite(hours) || hours < 0) {
      setError("Please enter a valid number of study hours.");
      return;
    }

    const data = {
      date: formData.date,
      hours,
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

    if (!data.subjects.length || !data.topics.length) {
      setError("Please enter at least one subject and one topic.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.put(`/study/${editingId}`, data);

      setEditingId(null);
      await fetchSessions();
    } catch (err) {
      console.error("Error updating session:", err);
      setError(
        err.response?.data?.message || "Could not update study session.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this study session?",
    );

    if (!confirmed) return;

    try {
      setError("");
      await api.delete(`/study/${id}`);

      setSessions((currentSessions) =>
        currentSessions.filter((session) => session._id !== id),
      );

      if (editingId === id) {
        setEditingId(null);
      }
    } catch (err) {
      console.error("Error deleting session:", err);
      setError(
        err.response?.data?.message || "Could not delete study session.",
      );
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[#e6d8cf] bg-white px-4 py-3 text-[#453b35] outline-none transition placeholder:text-[#b5a79e] focus:border-[#cf7897] focus:ring-4 focus:ring-[#f7dce6]/60";

  const labelClass = "mb-2 block text-sm font-semibold text-[#594b43]";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbf7f0]">
        <p className="text-[#887c73]">🌸 Gathering your study memories...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fbf7f0] px-4 py-10 sm:py-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#f7dce6]/50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-[#dce7d3]/60 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-4xl">
        {/* Heading */}
        <div className="mb-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#f0d4df] bg-[#f9e2e8] text-2xl shadow-sm">
            🌸
          </div>

          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#a94e72]">
            Your little study garden
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#453b35] sm:text-4xl">
            Study History
          </h1>

          <p className="mt-2 text-[#887c73]">
            Look back at how far you've grown, one session at a time.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Empty state */}
        {sessions.length === 0 ? (
          <div className="rounded-3xl border border-[#eee2d9] bg-[#fffdfa] p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f9e2e8] text-3xl">
              🌱
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#453b35]">
              Your garden is waiting
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#887c73]">
              No study sessions yet. Log your first session and start building a
              record of your progress.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {sessions.map((session) => (
              <div
                key={session._id}
                className="rounded-3xl border border-[#eee2d9] bg-[#fffdfa]/95 p-5 shadow-[0_5px_20px_rgba(91,68,55,0.05)] transition hover:shadow-[0_8px_26px_rgba(91,68,55,0.09)] sm:p-7"
              >
                {editingId === session._id ? (
                  /* Edit form */
                  <form onSubmit={handleUpdate} className="space-y-5">
                    <div className="mb-5 flex items-center gap-3 border-b border-[#eee2d9] pb-4">
                      <span className="text-2xl">🖊️</span>
                      <div>
                        <h2 className="text-xl font-bold text-[#453b35]">
                          Edit Study Session
                        </h2>
                        <p className="text-sm text-[#887c73]">
                          Update your learning record.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor={`date-${session._id}`}
                          className={labelClass}
                        >
                          Date
                        </label>
                        <input
                          id={`date-${session._id}`}
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          required
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`hours-${session._id}`}
                          className={labelClass}
                        >
                          Hours studied
                        </label>
                        <input
                          id={`hours-${session._id}`}
                          type="number"
                          name="hours"
                          min="0"
                          step="0.5"
                          value={formData.hours}
                          onChange={handleChange}
                          required
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor={`subjects-${session._id}`}
                        className={labelClass}
                      >
                        Subjects
                      </label>
                      <input
                        id={`subjects-${session._id}`}
                        name="subjects"
                        value={formData.subjects}
                        onChange={handleChange}
                        placeholder="DSA, AI/ML"
                        required
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`topics-${session._id}`}
                        className={labelClass}
                      >
                        Topics
                      </label>
                      <input
                        id={`topics-${session._id}`}
                        name="topics"
                        value={formData.topics}
                        onChange={handleChange}
                        placeholder="Arrays, Sliding Window"
                        required
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`notes-${session._id}`}
                        className={labelClass}
                      >
                        Notes
                      </label>
                      <textarea
                        id={`notes-${session._id}`}
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        className={`${inputClass} resize-y`}
                      />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="submit"
                        disabled={saving}
                        className="rounded-xl bg-[#cf7897] px-5 py-3 font-semibold text-white transition hover:bg-[#b86182] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </button>

                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => {
                          setEditingId(null);
                          setError("");
                        }}
                        className="rounded-xl border border-[#e6d8cf] px-5 py-3 font-semibold text-[#71665d] transition hover:bg-[#fbf0f3]"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Session details */
                  <>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#a94e72]">
                          {new Date(session.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            timeZone: "UTC",
                          })}
                        </p>

                        <h2 className="mt-1 text-2xl font-bold text-[#453b35]">
                          {session.hours}{" "}
                          {session.hours === 1 ? "hour" : "hours"}
                        </h2>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {(session.subjects || []).map((subject, index) => (
                          <span
                            key={`${subject}-${index}`}
                            className="rounded-full border border-[#f0d4df] bg-[#fbeaf0] px-3 py-1.5 text-sm font-medium text-[#a94e72]"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6">
                      <p className="mb-3 text-sm font-bold text-[#594b43]">
                        Topics explored
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {(session.topics || []).map((topic, index) => (
                          <span
                            key={`${topic}-${index}`}
                            className="rounded-lg border border-[#e3e9dc] bg-[#f1f5ed] px-3 py-2 text-sm text-[#65775c]"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>

                    {session.notes && (
                      <div className="mt-5 rounded-2xl border border-[#eee2d9] bg-[#fcf8f2] p-4">
                        <p className="text-sm font-bold text-[#594b43]">
                          A note to remember
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#887c73]">
                          {session.notes}
                        </p>
                      </div>
                    )}

                    {/* Edit and Delete */}
                    <div className="mt-6 flex flex-wrap gap-3 border-t border-[#eee2d9] pt-5">
                      <button
                        type="button"
                        onClick={() => handleEdit(session)}
                        className="rounded-xl border border-[#e8c4cf] bg-[#fdf1f5] px-4 py-2.5 text-sm font-semibold text-[#a94e72] transition hover:bg-[#f9e2e8]"
                      >
                        Edit session
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(session._id)}
                        className="rounded-xl border border-[#f0d1cc] bg-[#fff3f0] px-4 py-2.5 text-sm font-semibold text-[#b85f55] transition hover:bg-[#ffe6e1]"
                      >
                        Delete session
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="mt-7 text-center text-sm text-[#9b8d82]">
          🌿 Every session is another branch in your learning journey.
        </p>
      </div>
    </div>
  );
};

export default StudyHistory;
