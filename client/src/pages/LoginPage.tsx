import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router';
import { apiRequest } from '../services/api';
import type { AuthResponse } from '../types/api';
import { CheckSquare, Eye, EyeOff, Sun, Moon, Copy, Check } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  
  // Theme Toggle State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  // Quick Copy Helper for Demo Credentials
  const [copiedField, setCopiedField] = useState<'email' | 'pass' | null>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginForm) => {
    try {
      setServerError('');

      const result = await apiRequest<AuthResponse>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify(values),
        }
      );

      localStorage.setItem('kanbot_token', result.token);
      localStorage.setItem(
        'kanbot_user',
        JSON.stringify(result.user)
      );

      navigate('/projects');
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : 'Login failed'
      );
    }
  };

  const fillDemoCredentials = (email: string, pass: string, field: 'email' | 'pass') => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Theme Toggle Floating Button */}
      <button
        type="button"
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`fixed top-5 right-5 z-50 p-2.5 rounded-xl backdrop-blur-md border shadow-md transition ${
          isDarkMode 
            ? 'bg-slate-900/80 border-slate-700 text-slate-200 hover:bg-slate-800' 
            : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-100'
        }`}
        aria-label="Toggle Theme"
      >
        {isDarkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-indigo-600" />}
      </button>

      {/* Left Section - Hero Visual (Visible on LG screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white flex-col justify-between p-14 overflow-hidden border-r border-slate-800/50">
        
        {/* Background Glow Accent */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <CheckSquare size={28} className="text-white" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-white">
            Kanbot
          </span>
        </div>

        <div className="relative z-10 my-auto">
          <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6 tracking-tight text-white">
            Plan smarter.
            <br />
            Build better.
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              Work together.
            </span>
          </h1>

          <p className="text-slate-300 text-lg max-w-md leading-relaxed font-normal">
            Manage your projects, organize your tasks,
            and let AI help you achieve more.
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between text-slate-400 text-sm border-t border-slate-800/80 pt-6">
          <p>© 2026 Kanbot. All rights reserved.</p>
          <span className="text-xs bg-slate-800/80 text-slate-300 px-3 py-1 rounded-full border border-slate-700">v2.4 Pro</span>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-8">

          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md shadow-indigo-500/20">
              <CheckSquare size={26} />
            </div>
            <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Kanbot
            </span>
          </div>

          <div>
            <h2 className={`text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Welcome back
            </h2>
            <p className={`mt-2 text-sm sm:text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
              Enter your details to access your account.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className={`w-full border rounded-xl p-3.5 outline-none transition duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-900 text-white placeholder-slate-500 border-slate-700 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20' 
                    : 'bg-white text-slate-900 placeholder-slate-400 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                } ${errors.email ? 'border-red-500 focus:ring-red-500/20' : ''}`}
              />
              {errors.email && (
                <p className={`text-xs font-medium mt-1.5 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={`w-full border rounded-xl p-3.5 pr-12 outline-none transition duration-200 ${
                    isDarkMode 
                      ? 'bg-slate-900 text-white placeholder-slate-500 border-slate-700 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20' 
                      : 'bg-white text-slate-900 placeholder-slate-400 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                  } ${errors.password ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition p-1 ${
                    isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'
                  }`}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className={`text-xs font-medium mt-1.5 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <div className={`p-3.5 rounded-xl text-sm font-medium flex items-center gap-2 border ${
                isDarkMode 
                  ? 'bg-red-950/60 border-red-800 text-red-300' 
                  : 'bg-red-50 border-red-200 text-red-600'
              }`}>
                <span>{serverError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-600/25 dark:shadow-indigo-900/40 transition duration-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className={`text-center text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
            Don't have an account?{' '}
            <Link
              to="/register"
              className={`font-semibold hover:underline ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}
            >
              Create account
            </Link>
          </p>

          {/* Enhanced Interactive Demo Account Box */}
          <div className={`border p-4 rounded-2xl relative overflow-hidden ${
            isDarkMode 
              ? 'bg-slate-900 border-slate-800 text-slate-200' 
              : 'bg-slate-100 border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Demo Account
              </p>
              <button
                type="button"
                onClick={() => fillDemoCredentials('demo@kanbot.dev', 'password123', 'email')}
                className={`text-xs font-medium flex items-center gap-1 px-2.5 py-1 rounded-md border transition ${
                  isDarkMode 
                    ? 'text-indigo-400 bg-indigo-950/60 border-indigo-800/60 hover:text-indigo-300' 
                    : 'text-indigo-600 bg-indigo-50 border-indigo-200/60 hover:text-indigo-700'
                }`}
              >
                {copiedField ? <Check size={12} /> : <Copy size={12} />}
                {copiedField ? 'Filled!' : 'Auto fill'}
              </button>
            </div>

            <div className="space-y-1 font-mono text-xs">
              <p className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500 font-sans'}>Email: </span>demo@kanbot.dev
              </p>
              <p className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500 font-sans'}>Password: </span>password123
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}