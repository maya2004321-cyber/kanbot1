import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router';

export default function Navbar() {
  const { projectId } = useParams();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    {
      label: 'Projects',
      href: '/projects',
    },
    ...(projectId
      ? [
          {
            label: 'Backlog',
            href: `/projects/${projectId}/backlog`,
          },
          {
            label: 'Sprints',
            href: `/projects/${projectId}/sprints`,
          },
          {
            label: 'Board',
            href: `/projects/${projectId}/board`,
          },
          {
            label: 'AI Assistant',
            href: `/projects/${projectId}/ai`,
          },
        ]
      : []),
  ];

  function isActive(href: string) {
    return location.pathname === href;
  }

  function handleNavigate() {
    setMenuOpen(false);
  }

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md transition-colors duration-300 bg-gradient-to-r from-indigo-200 via-slate-300 to-purple-200 border-b border-indigo-400 shadow-md shadow-indigo-300/60 dark:bg-gradient-to-r dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:border-slate-800 dark:shadow-slate-950/80">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo - بدون إيموجي ومع نص متدرج وبارز */}
        <Link
          to="/projects"
          onClick={handleNavigate}
          className="flex items-center gap-2.5 text-xl font-extrabold transition-transform hover:scale-105"
        >
          <span className="bg-gradient-to-r from-indigo-950 via-purple-900 to-indigo-900 dark:from-indigo-400 dark:via-purple-300 dark:to-indigo-200 bg-clip-text text-transparent tracking-tight text-2xl">
            Kanbot
          </span>
        </Link>

        {/* Desktop Navigation - كلمات واضحة جداً وعالية التباين */}
        <div className="hidden items-center gap-1.5 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 ${
                isActive(item.href)
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/30 dark:from-indigo-600 dark:to-purple-600'
                  : 'text-slate-950 hover:bg-indigo-300/70 hover:text-indigo-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="rounded-xl border p-2 text-sm transition md:hidden border-indigo-400 bg-slate-300 text-slate-950 hover:bg-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="border-t px-4 py-3 md:hidden transition-all duration-200 bg-gradient-to-b from-slate-300/95 to-indigo-200/95 border-indigo-400 dark:bg-slate-900/95 dark:border-slate-800">
          <div className="flex flex-col gap-1.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={handleNavigate}
                className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                    : 'text-slate-950 hover:bg-indigo-300/70 hover:text-indigo-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}