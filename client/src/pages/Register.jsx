import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register(name, email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fbf7f0] px-4 py-12">
      {/* Decorative background accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-8 h-72 w-72 rounded-full bg-[#f7dce6]/60 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-[#dce7d3]/60 blur-3xl"
      />

      <div className="relative z-20 w-full max-w-md rounded-3xl border border-[#eee2d9] bg-[#fffdfa]/95 p-7 shadow-[0_12px_40px_rgba(91,68,55,0.10)] backdrop-blur-sm sm:p-9">
        {/* Brand */}
        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f9e2e8] text-2xl">
            🌸
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#a94e72]">
              Study Tracker
            </p>
            <p className="mt-1 text-xs text-[#887c73]">
              Your little study garden
            </p>
          </div>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-[#453b35]">
          Let's grow together
        </h1>

        <p className="mt-2 leading-relaxed text-[#887c73]">
          Create your account and start nurturing your daily study habits.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-semibold text-[#594b43]"
            >
              Name
            </label>

            <input
              id="name"
              type="text"
              autoComplete="name"
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="What should we call you?"
              className="w-full rounded-xl border border-[#e6d8cf] bg-white px-4 py-3 text-[#453b35] outline-none transition placeholder:text-[#b5a79e] focus:border-[#cf7897] focus:ring-4 focus:ring-[#f7dce6]/70"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-[#594b43]"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full rounded-xl border border-[#e6d8cf] bg-white px-4 py-3 text-[#453b35] outline-none transition placeholder:text-[#b5a79e] focus:border-[#cf7897] focus:ring-4 focus:ring-[#f7dce6]/70"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-[#594b43]"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={72}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Create a strong password"
              className="w-full rounded-xl border border-[#e6d8cf] bg-white px-4 py-3 text-[#453b35] outline-none transition placeholder:text-[#b5a79e] focus:border-[#cf7897] focus:ring-4 focus:ring-[#f7dce6]/70"
            />

            <p className="mt-2 flex items-center gap-1.5 text-xs text-[#71886b]">
              <span aria-hidden="true">🌱</span>
              Use at least 12 characters.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#cf7897] px-4 py-3.5 font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#b86182] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Planting the seeds..." : "Create Account"}
            {!submitting && (
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#eee2d9]" />
          <span className="text-xs text-[#b09f94]">
            Every day is a new beginning
          </span>
          <div className="h-px flex-1 bg-[#eee2d9]" />
        </div>

        <p className="text-center text-sm text-[#887c73]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold text-[#a94e72] underline decoration-[#e8c4cf] underline-offset-4 transition hover:text-[#843c5a]"
          >
            Log in
          </Link>
        </p>

        <p className="mt-7 text-center text-xs text-[#9b8d82]">
          🌸 Little by little, day by day.
        </p>
      </div>
    </div>
  );
};

export default Register;
