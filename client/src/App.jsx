import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import StudyEntry from "./pages/StudyEntry";
import StudyHistory from "./pages/StudyHistory";
import Login from "./pages/Login";
import Register from "./pages/Register";

import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";

const Navigation = () => {
  const { user, logout, loading } = useAuth();

  if (loading || !user) return null;

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="text-xl font-bold text-slate-900">
          Study Tracker
        </Link>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-slate-600 hover:text-blue-600"
          >
            Dashboard
          </Link>

          <Link
            to="/log"
            className="text-sm font-medium text-slate-600 hover:text-blue-600"
          >
            Log Study
          </Link>

          <Link
            to="/history"
            className="text-sm font-medium text-slate-600 hover:text-blue-600"
          >
            History
          </Link>

          <button
            type="button"
            onClick={logout}
            className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
          >
            Log Out
          </button>
        </div>
      </div>
    </nav>
  );
};

const AppRoutes = () => (
  <>
    <Navigation />

    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/log" element={<StudyEntry />} />
        <Route path="/history" element={<StudyHistory />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
