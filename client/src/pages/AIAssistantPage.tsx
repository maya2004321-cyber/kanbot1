import { useState, useEffect } from 'react';
import AIChat from '../components/AIChat';
import Navbar from '../components/Navbar';
import { Bot, Sun, Moon, Sparkles } from 'lucide-react';

export default function AIAssistantPage() {
  const projectId = window.location.pathname.split('/').filter(Boolean)[1];
  console.log('AI projectId:', projectId);

  // Theme State Controller & Synchronizer
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
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

  if (!projectId) {
    return (
      <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className={`rounded-2xl border p-6 text-center shadow-sm ${isDarkMode ? 'border-red-900 bg-red-950/40 text-red-300' : 'border-red-200 bg-red-50 text-red-700'}`}>
            <p className="font-semibold text-sm sm:text-base">Project ID is missing.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar />

      <main className="w-full flex-1 px-3 sm:px-6 lg:px-12 py-6 sm:py-8 max-w-[1600px] mx-auto overflow-x-hidden">
        
        {/* Header with Theme Toggle Button */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl shadow-md shrink-0 ${isDarkMode ? 'bg-indigo-600 text-white shadow-indigo-900/40' : 'bg-indigo-600 text-white shadow-indigo-500/20'}`}>
                <Bot size={24} className="sm:w-[26px] sm:h-[26px]" />
              </div>
              <span className="truncate flex items-center gap-2">
                AI Assistant 
                <Sparkles size={20} className="text-amber-500 shrink-0" />
              </span>
            </h1>
            <p className={`mt-2 text-sm sm:text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
              Get help managing your projects, backlog, tasks and sprints.
            </p>
          </div>

          <div className="flex items-center justify-end sm:justify-start">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-full sm:w-auto p-3 rounded-xl border shadow-sm transition flex items-center justify-center gap-2 font-semibold text-sm ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800' 
                  : 'bg-white border-slate-200 text-indigo-600 hover:bg-slate-100'
              }`}
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>

        {/* Chat Wrapper Container with explicit dark theme styles for inputs inside */}
        <div className={`rounded-2xl sm:rounded-3xl border shadow-sm transition-all overflow-hidden ${
          isDarkMode 
            ? 'border-slate-800 bg-slate-900 text-white shadow-black/40 [&_input]:bg-slate-950 [&_input]:text-white [&_input]:border-slate-700 [&_textarea]:bg-slate-950 [&_textarea]:text-white [&_textarea]:border-slate-700' 
            : 'border-slate-200/80 bg-white text-slate-900 shadow-slate-200/50'
        }`}>
          <div className="p-3 sm:p-6 w-full max-w-5xl mx-auto">
            <AIChat projectId={projectId} />
          </div>
        </div>

      </main>
    </div>
  );
}