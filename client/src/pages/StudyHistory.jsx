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

  // Fetch all study sessions.
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

  // Open the edit form with the selected session's data.
  const handleEdit = (session) => {
    setEditingId(session._id);

    setFormData({
      date: new Date(session.date).toISOString().split("T")[0],
      hours: String(session.hours),
      subjects: session.subjects.join(", "),
      topics: session.topics.join(", "),
      notes: session.notes || "",
    });

    setError("");
  };

  // Update form fields as the user types.
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Save the edited session.
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

  // Delete a session after confirmation.
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this study session?",
    );

    if (!confirmed) return;

    try {
      setError("");
      await api.delete(`/study/${id}`);

      // Remove the deleted session from the UI immediately.
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-500">Loading study history...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        {/* Page heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Study Tracker
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Study History
          </h1>

          <p className="mt-2 text-slate-500">
            Review and manage your study sessions.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Empty state */}
        {sessions.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800">
              No study sessions yet
            </h2>

            <p className="mt-2 text-slate-500">
              Start logging your study sessions to see them here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session._id}
                className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                {editingId === session._id ? (
                  /* Edit form */
                  <form onSubmit={handleUpdate} className="space-y-5">
                    <h2 className="text-xl font-bold text-slate-900">
                      Edit Study Session
                    </h2>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor={`date-${session._id}`}
                          className="mb-2 block text-sm font-semibold text-slate-700"
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
                          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`hours-${session._id}`}
                          className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                          Hours Studied
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
                          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor={`subjects-${session._id}`}
                        className="mb-2 block text-sm font-semibold text-slate-700"
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
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`topics-${session._id}`}
                        className="mb-2 block text-sm font-semibold text-slate-700"
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
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`notes-${session._id}`}
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Notes
                      </label>

                      <textarea
                        id={`notes-${session._id}`}
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="3"
                        className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
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
                        className="rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
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
                        <p className="text-sm font-medium text-blue-600">
                          {new Date(session.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            timeZone: "UTC",
                          })}
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-slate-900">
                          {session.hours}{" "}
                          {session.hours === 1 ? "hour" : "hours"}
                        </h2>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {session.subjects.map((subject, index) => (
                          <span
                            key={`${subject}-${index}`}
                            className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5">
                      <p className="mb-2 text-sm font-semibold text-slate-700">
                        Topics
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {session.topics.map((topic, index) => (
                          <span
                            key={`${topic}-${index}`}
                            className="rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-600"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>

                    {session.notes && (
                      <div className="mt-5 border-t border-slate-100 pt-4">
                        <p className="text-sm font-semibold text-slate-700">
                          Notes
                        </p>

                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {session.notes}
                        </p>
                      </div>
                    )}

                    {/* Edit and Delete actions */}
                    <div className="mt-5 flex gap-3 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() => handleEdit(session)}
                        className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(session._id)}
                        className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyHistory;
