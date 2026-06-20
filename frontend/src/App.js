import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Moon, Sun, LogOut, Zap, LayoutDashboard, PlusCircle } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import AddTask from './pages/AddTask';
import Login from './pages/Login';
import { isTokenValid, clearStoredUser, getStoredUser } from './utils/auth';

function App() {
  // Persist dark mode in localStorage
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => isTokenValid());

  // On mount: auto-logout if token is expired
  useEffect(() => {
    if (!isTokenValid()) {
      clearStoredUser();
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    clearStoredUser();
    setIsAuthenticated(false);
  };

  const user = getStoredUser();
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?';

  return (
    <Router>
      <div className="min-h-screen pb-16">

        {/* ── Navbar ───────────────────────────────────────────────────── */}
        <nav className="sticky top-0 z-50 glass-card border-b border-[var(--color-border)]">
          <div className="max-w-7xl mx-auto flex justify-between items-center px-5 py-3.5">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg group-hover:shadow-violet-400/40 transition-shadow">
                <Zap size={18} className="text-white" fill="white" />
              </div>
              <span className="text-xl font-extrabold gradient-text tracking-tight">TaskFlow Pro</span>
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-3">

              {/* Theme toggle */}
              <button
                id="theme-toggle"
                onClick={() => setDarkMode(d => !d)}
                className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="transition-all duration-300" style={{ transform: darkMode ? 'rotate(0deg)' : 'rotate(180deg)', display: 'inline-flex' }}>
                  {darkMode
                    ? <Sun size={18} className="text-amber-400" />
                    : <Moon size={18} style={{ color: 'var(--color-primary)' }} />
                  }
                </span>
              </button>

              {isAuthenticated && (
                <>
                  {/* Nav links */}
                  <Link
                    to="/"
                    id="nav-dashboard"
                    className="hidden md:flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:scale-105"
                    style={{ color: 'var(--color-text-muted)', background: 'var(--color-surface-2)' }}
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>

                  <Link
                    to="/add"
                    id="nav-add-task"
                    className="btn-primary flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl shadow-lg"
                  >
                    <PlusCircle size={16} /> New Task
                  </Link>

                  {/* User avatar + logout */}
                  <div className="flex items-center gap-2">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-md"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #e11d78)' }}
                      title={user?.email}
                    >
                      {userInitial}
                    </div>
                    <button
                      id="btn-logout"
                      onClick={handleLogout}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                      style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                      title="Logout"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <main className="max-w-7xl mx-auto px-4 mt-8">
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login setAuth={setIsAuthenticated} /> : <Navigate to="/" />} />
            <Route path="/"      element={isAuthenticated  ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/add"   element={isAuthenticated  ? <AddTask />   : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;