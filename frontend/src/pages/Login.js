import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/api';
import { setStoredUser } from '../utils/auth';
import { sanitizeFormData } from '../utils/sanitize';
import { Mail, Lock, User, Zap, Eye, EyeOff, AlertCircle } from 'lucide-react';

const COOLDOWN_SECONDS = 3;
const MAX_FAILURES     = 3;

const Login = ({ setAuth }) => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister]   = useState(false);
  const [formData, setFormData]       = useState({ name: '', email: '', password: '' });
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [showPass, setShowPass]       = useState(false);
  const [cooldown, setCooldown]       = useState(0);
  const failCountRef                  = useRef(0);

  const startCooldown = () => {
    let secs = COOLDOWN_SECONDS;
    setCooldown(secs);
    const id = setInterval(() => {
      secs -= 1;
      setCooldown(secs);
      if (secs <= 0) clearInterval(id);
    }, 1000);
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cooldown > 0 || loading) return;
    setError('');
    setLoading(true);

    try {
      // Sanitize before sending
      const clean = sanitizeFormData(formData);
      const res = isRegister
        ? await register(clean)
        : await login({ email: clean.email, password: clean.password });

      setStoredUser(res.data);
      failCountRef.current = 0;
      setAuth(true);
      navigate('/');
    } catch (err) {
      failCountRef.current += 1;
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
      if (failCountRef.current >= MAX_FAILURES) startCooldown();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">

      {/* ── Floating background blobs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div
          className="absolute animate-blob opacity-30 dark:opacity-20"
          style={{
            width: 420, height: 420, top: '5%', left: '-8%',
            background: 'radial-gradient(circle, #7c3aed, #a855f7)',
            filter: 'blur(60px)', animationDelay: '0s',
          }}
        />
        <div
          className="absolute animate-blob opacity-25 dark:opacity-15"
          style={{
            width: 380, height: 380, bottom: '5%', right: '-6%',
            background: 'radial-gradient(circle, #e11d78, #f59e0b)',
            filter: 'blur(60px)', animationDelay: '3.5s',
          }}
        />
        <div
          className="absolute animate-blob opacity-20 dark:opacity-10"
          style={{
            width: 280, height: 280, top: '40%', left: '55%',
            background: 'radial-gradient(circle, #06b6d4, #3b82f6)',
            filter: 'blur(50px)', animationDelay: '7s',
          }}
        />
      </div>

      {/* ── Auth Card ── */}
      <div
        className="glass-card animate-fade-up relative w-full max-w-md rounded-3xl overflow-hidden"
        style={{ zIndex: 1 }}
      >
        {/* Gradient top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
          style={{ background: 'linear-gradient(90deg, #7c3aed, #e11d78, #f59e0b)' }}
        />

        <div className="p-8 pt-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #e11d78)' }}
            >
              <Zap size={24} className="text-white" fill="white" />
            </div>
            <h1 className="text-2xl font-extrabold" style={{ color: 'var(--color-text)' }}>
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              {isRegister ? 'Join TaskFlow Pro today' : 'Sign in to continue to TaskFlow Pro'}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div
              className="flex items-start gap-3 p-4 rounded-2xl mb-5 text-sm animate-fade-up"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Name field (register only) */}
            {isRegister && (
              <div className="animate-fade-up">
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text)' }}>
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
                  <input
                    id="input-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your full name"
                    className="premium-input has-icon-left"
                    value={formData.name}
                    onChange={handleChange('name')}
                    required={isRegister}
                    maxLength={100}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text)' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  id="input-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="premium-input has-icon-left"
                  value={formData.email}
                  onChange={handleChange('email')}
                  required
                  maxLength={254}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text)' }}>
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  id="input-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  placeholder={isRegister ? 'Create a strong password' : 'Enter your password'}
                  className="premium-input has-icon-left has-icon-right"
                  value={formData.password}
                  onChange={handleChange('password')}
                  required
                  maxLength={128}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-80"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="btn-submit-auth"
              type="submit"
              disabled={loading || cooldown > 0}
              className="btn-primary w-full py-3 rounded-xl mt-2 flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : cooldown > 0 ? (
                `Wait ${cooldown}s…`
              ) : (
                isRegister ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {/* Toggle */}
          <p className="mt-6 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              id="btn-toggle-auth-mode"
              onClick={() => { setIsRegister(r => !r); setError(''); }}
              className="font-bold transition-colors hover:opacity-80"
              style={{ color: 'var(--color-primary)' }}
            >
              {isRegister ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;