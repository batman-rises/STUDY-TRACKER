import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import StudyEntry from "./pages/StudyEntry";
import StudyHistory from "./pages/StudyHistory";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-xl font-bold text-slate-900">
            Study Tracker
          </Link>

          <div className="flex gap-6">
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
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/log" element={<StudyEntry />} />
        <Route path="/history" element={<StudyHistory />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
