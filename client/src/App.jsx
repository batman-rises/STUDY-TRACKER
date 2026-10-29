import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  NavLink,
  useNavigate,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import StudyEntry from "./pages/StudyEntry";
import StudyHistory from "./pages/StudyHistory";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CherryBlossomPetals from "./components/CherryBlossomPetals";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";

const Navigation = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  if (loading || !user) return null;

  const navClass = ({ isActive }) =>
    `rounded-xl px-3 py-2 text-sm font-semibold transition ${
      isActive
        ? "bg-[#f7e2e9] text-[#a94e72]"
        : "text-[#71665d] hover:bg-[#fbf0f3] hover:text-[#a94e72]"
    }`;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-[#eee2d9] bg-[#fffaf6]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="group flex items-center gap-3">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f9e2e8] text-2xl transition group-hover:rotate-6"
            aria-hidden="true"
          >
            🌸
          </span>

          <span>
            <span className="block text-lg font-bold tracking-tight text-[#453b35]">
              Study Tracker
            </span>
            <span className="block text-xs text-[#887c73]">
              Your little study garden
            </span>
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <NavLink to="/" end className={navClass}>
            Dashboard
          </NavLink>

          <NavLink to="/log" className={navClass}>
            Log Study
          </NavLink>

          <NavLink to="/history" className={navClass}>
            History
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className="ml-1 rounded-xl border border-[#e8c4cf] px-3 py-2 text-sm font-semibold text-[#a94e72] transition hover:bg-[#f9e5ec]"
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
    <CherryBlossomPetals />
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
