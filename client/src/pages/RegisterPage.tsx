import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { apiRequest } from '../services/api';
import type { AuthResponse } from '../types/api';
import {
  User,
  Mail,
  Lock,
  Sun,
  Moon,
  ArrowRight,
  UserPlus,
  AlertCircle,
} from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Theme Controller State & Synchronizer
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return (
      localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches)
    );
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(
        ' Passwords do not match'
      );
      return;
    }

    if (password.length < 8) {
      setError(
        ' Password must be at least 8 characters'
      );
      return;
    }

    setLoading(true);

    try {
      const result = await apiRequest<AuthResponse>(
        '/auth/register',
        {
          method: 'POST',
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        }
      );

      // Save token and user
      localStorage.setItem(
        'kanbot_token',
        result.token
      );

      localStorage.setItem(
        'kanbot_user',
        JSON.stringify(result.user)
      );

      // Go to Projects
      navigate('/projects');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'حدث خطأ أثناء الاتصال بالسيرفر'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        isDarkMode
          ? 'bg-slate-950 text-white'
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        <div className="w-full max-w-md">

          {/* Header Card */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">

              <div
                className={`p-2.5 rounded-2xl shadow-md ${
                  isDarkMode
                    ? 'bg-indigo-600 text-white shadow-indigo-900/40'
                    : 'bg-indigo-600 text-white shadow-indigo-500/20'
                }`}
              >
                <UserPlus size={24} />
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  Create a new account
                </h1>

                <p
                  className={`text-xs sm:text-sm ${
                    isDarkMode
                      ? 'text-slate-400'
                      : 'text-slate-500'
                  }`}
                >
                  Create your account
                </p>
              </div>
            </div>

            {/* Theme Toggle Button */}
             <button
              type="button"
              onClick={() =>
                setIsDarkMode((prev) => !prev)
              }
              className={`p-2.5 rounded-xl border shadow-sm transition ${
                isDarkMode
                  ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800'
                  : 'bg-white border-slate-200 text-indigo-600 hover:bg-slate-100'
              }`}
              aria-label="Toggle Theme"
            >
              {isDarkMode ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>
          </div>

          {/* Form Container */}
          <div
            className={`rounded-2xl sm:rounded-3xl border p-6 sm:p-8 shadow-xl transition-all ${
              isDarkMode
                ? 'border-slate-800 bg-slate-900 text-white shadow-black/40'
                : 'border-slate-200 bg-white text-slate-900 shadow-slate-200/50'
            }`}
          >

            {/* Error Message */}
            {error && (
              <div
                className={`mb-6 flex items-center gap-2.5 rounded-xl border p-4 text-xs sm:text-sm font-semibold ${
                  isDarkMode
                    ? 'bg-red-950/60 border-red-900/60 text-red-300'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                <AlertCircle
                  size={18}
                  className="shrink-0 text-red-500"
                />

                <span className="break-words">
                  {error}
                </span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {/* Full Name */}
              <div>
                <label
                  className={`block text-xs sm:text-sm font-semibold mb-2 ${
                    isDarkMode
                      ? 'text-slate-300'
                      : 'text-slate-700'
                  }`}
                >
                   Full Name
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                      isDarkMode
                        ? 'text-slate-500'
                        : 'text-slate-400'
                    }`}
                  />

                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="John Doe"
                    className={`w-full border rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm outline-none transition duration-200 ${
                      isDarkMode
                        ? 'bg-slate-950 text-white placeholder-slate-500 border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                        : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                    }`}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  className={`block text-xs sm:text-sm font-semibold mb-2 ${
                    isDarkMode
                      ? 'text-slate-300'
                      : 'text-slate-700'
                  }`}
                >
                   Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                      isDarkMode
                        ? 'text-slate-500'
                        : 'text-slate-400'
                    }`}
                  />
                    <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="name@example.com"
                    className={`w-full border rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm outline-none transition duration-200 ${
                      isDarkMode
                        ? 'bg-slate-950 text-white placeholder-slate-500 border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                        : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                    }`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  className={`block text-xs sm:text-sm font-semibold mb-2 ${
                    isDarkMode
                      ? 'text-slate-300'
                      : 'text-slate-700'
                  }`}
                >
                   Password (At least 8 characters)
                </label>

                <div className="relative">
                  <Lock
                    size={18}
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                      isDarkMode
                        ? 'text-slate-500'
                        : 'text-slate-400'
                    }`}
                  />

                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="••••••••"
                    className={`w-full border rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm outline-none transition duration-200 ${
                      isDarkMode
                        ? 'bg-slate-950 text-white placeholder-slate-500 border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                        : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                    }`}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  className={`block text-xs sm:text-sm font-semibold mb-2 ${
                    isDarkMode
                      ? 'text-slate-300'
                      : 'text-slate-700'
                  }`}
                >
                   Confirm Password
                </label>

                <div className="relative">
                  <Lock
                    size={18}
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                      isDarkMode
                        ? 'text-slate-500'
                        : 'text-slate-400'
                    }`}
                  />

                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="••••••••"
                    className={`w-full border rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm outline-none transition duration-200 ${
                      isDarkMode
                        ? 'bg-slate-950 text-white placeholder-slate-500 border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                        : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                    }`}
                  />
                </div>
              </div>
                {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 py-3.5 font-semibold text-white shadow-lg shadow-indigo-600/25 disabled:opacity-50 transition duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />

                    <span>
                      creating account ...
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      creat an account
                    </span>

                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Link to Login */}
            <div
              className={`mt-6 pt-5 border-t text-center text-xs sm:text-sm ${
                isDarkMode
                  ? 'border-slate-800 text-slate-400'
                  : 'border-slate-100 text-slate-500'
              }`}
            >
              Already have an account?{' '}

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer transition"
              >
                sign in
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}