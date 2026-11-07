import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  getProjectSprints,
  createSprint,
  updateSprint,
  deleteSprint,
  startSprint,
  completeSprint,
  getSprintBoard,
} from '../services/sprint';

import {
  getBacklogTodos,
  updateTodo,
} from '../services/todo';

import type {
  Sprint,
  Todo,
  CreateSprintRequest,
} from '../types/api';

import Navbar from '../components/Navbar';
import { Target, Calendar, Plus, AlertCircle, Play, CheckCircle2, Trash2, Edit3, Eye, X, Layers, Sun, Moon } from 'lucide-react';

type SprintBoard = Awaited<ReturnType<typeof getSprintBoard>>;

export default function SprintPage({
  projectId,
}: {
  projectId: string;
}) {

  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [backlogTodos, setBacklogTodos] = useState<Todo[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [board, setBoard] = useState<SprintBoard | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);

  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [selectedTodoIds, setSelectedTodoIds] = useState<string[]>([]);

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

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [sprintData, todoData] = await Promise.all([
        getProjectSprints(projectId),
        getBacklogTodos(projectId),
      ]);

      setSprints(sprintData);
      setBacklogTodos(todoData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load sprint data'
      );
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const resetForm = () => {
    setName('');
    setGoal('');
    setStartDate('');
    setEndDate('');
    setSelectedTodoIds([]);
    setEditingSprint(null);
    setShowForm(false);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (sprint: Sprint) => {
    setEditingSprint(sprint);
    setName(sprint.name);
    setGoal(sprint.goal ?? '');
    setStartDate(sprint.startDate?.slice(0, 10) ?? '');
    setEndDate(sprint.endDate?.slice(0, 10) ?? '');
    setShowForm(true);
  };

  const handleSaveSprint = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Sprint name is required');
      return;
    }

    if (startDate && endDate && endDate < startDate) {
      setError('End date must be after start date');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editingSprint) {
        await updateSprint(editingSprint.id, {
          name: name.trim(),
          goal: goal.trim(),
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });
      } else {
        const payload: CreateSprintRequest = {
          name: name.trim(),
          goal: goal.trim(),
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          todoIds: selectedTodoIds,
        };

        await createSprint(projectId, payload);
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save sprint'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSprint = async (sprint: Sprint) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${sprint.name}"?`
    );

    if (!confirmed) return;

    try {
      await deleteSprint(sprint.id);

      if (selectedSprint?.id === sprint.id) {
        setSelectedSprint(null);
        setBoard(null);
      }

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete sprint'
      );
    }
  };

  const handleStartSprint = async (sprint: Sprint) => {
    try {
      await startSprint(sprint.id, {
        startDate: sprint.startDate ?? undefined,
        endDate: sprint.endDate ?? undefined,
      });

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to start sprint'
      );
    }
  };

  const handleCompleteSprint = async (sprint: Sprint) => {
    const confirmed = window.confirm(
      `Complete "${sprint.name}"? Unfinished tasks will be moved to backlog.`
    );

    if (!confirmed) return;

    try {
      await completeSprint(sprint.id, 'backlog');

      setSelectedSprint(null);
      setBoard(null);

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to complete sprint'
      );
    }
  };

  const handleOpenBoard = async (sprint: Sprint) => {
    setSelectedSprint(sprint);
    setBoard(null);
    setError('');

    try {
      const result = await getSprintBoard(sprint.id);
      setBoard(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load sprint board'
      );
    }
  };

  const handleAddTodo = async (todo: Todo) => {
    if (!selectedSprint) return;

    try {
      await updateTodo(todo.id, {
        sprintId: selectedSprint.id,
      });

      await loadData();

      const result = await getSprintBoard(selectedSprint.id);
      setBoard(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to add task'
      );
    }
  };

  const handleRemoveTodo = async (todo: Todo) => {
    if (!selectedSprint) return;

    try {
      await updateTodo(todo.id, {
        sprintId: 'backlog',
      });

      await loadData();

      const result = await getSprintBoard(selectedSprint.id);
      setBoard(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to remove task'
      );
    }
  };

  const boardTodos = useMemo(() => {
    if (!board) return [];

    const value = board as unknown as {
      todos?: Todo[];
      board?: Todo[];
    };

    return value.todos ?? value.board ?? [];
  }, [board]);

  const stats = useMemo(() => {
    return {
      total: sprints.length,
      planned: sprints.filter((s) => s.status === 'planned').length,
      active: sprints.filter((s) => s.status === 'active').length,
      completed: sprints.filter((s) => s.status === 'completed').length,
    };
  }, [sprints]);

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 font-semibold text-base sm:text-lg">
            <span className="w-6 h-6 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin shrink-0" />
            <span>Loading sprints...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar />

      <main className="w-full px-2 sm:px-4 lg:px-8 py-4 sm:py-8 max-w-[1600px] mx-auto overflow-x-hidden">

        {/* Header with Theme Toggle Button */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
              <div className={`p-2 rounded-2xl shadow-md shrink-0 ${isDarkMode ? 'bg-indigo-600 text-white shadow-indigo-900/40' : 'bg-indigo-600 text-white shadow-indigo-500/20'}`}>
                <Target size={22} className="sm:w-[26px] sm:h-[26px]" />
              </div>
              <span className="truncate">Sprint Planning</span>
            </h1>
            <p className={`mt-1.5 text-xs sm:text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
              Plan your work, organize tasks and manage your sprints with precision.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 sm:p-3 rounded-xl border shadow-sm transition flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm flex-1 sm:flex-initial ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800' 
                  : 'bg-white border-slate-200 text-indigo-600 hover:bg-slate-100'
              }`}
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              <span>{isDarkMode ? 'Light' : 'Dark'}</span>
            </button>

            <button
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 px-4 sm:px-5 py-2.5 sm:py-3.5 font-semibold text-white shadow-lg shadow-indigo-600/25 transition duration-200 flex-1 sm:flex-initial text-xs sm:text-sm whitespace-nowrap"
            >
              <Plus size={16} />
              <span>Create Sprint</span>
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className={`mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-3.5 text-xs sm:text-sm font-semibold shadow-sm ${
            isDarkMode 
              ? 'bg-red-950/60 border-red-900/60 text-red-300' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <span className="break-all">{error}</span>
            </div>
            <button
              onClick={() => setError('')}
              className="self-end sm:self-auto p-1.5 rounded-lg hover:bg-red-500/10 transition shrink-0"
              aria-label="Close error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="mb-6 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
          {[
            { label: 'Total Sprints', value: stats.total, icon: Layers, color: 'text-indigo-500' },
            { label: 'Planned', value: stats.planned, icon: Calendar, color: 'text-amber-500' },
            { label: 'Active', value: stats.active, icon: Play, color: 'text-emerald-500' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-blue-500' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`rounded-2xl border p-3.5 sm:p-5 shadow-sm transition duration-200 hover:shadow-md ${
                  isDarkMode 
                    ? 'border-slate-800 bg-slate-900/90 text-white' 
                    : 'border-slate-200/80 bg-white text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</p>
                  <Icon size={16} className={`${item.color} shrink-0`} />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">{item.value}</p>
              </div>
            );
          })}
        </div>

        {/* Create / Edit Form */}
        {showForm && (
          <form
            onSubmit={handleSaveSprint}
            className={`mb-6 rounded-2xl sm:rounded-3xl border p-4 sm:p-8 shadow-xl transition-all ${
              isDarkMode 
                ? 'border-slate-800 bg-slate-900 text-white shadow-black/40' 
                : 'border-slate-200 bg-white text-slate-900 shadow-slate-200/50'
            }`}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base sm:text-xl font-extrabold tracking-tight">
                {editingSprint ? 'Edit Sprint' : 'Create New Sprint'}
              </h2>
              <button
                type="button"
                onClick={resetForm}
                className={`p-1.5 rounded-xl border transition ${isDarkMode ? 'border-slate-800 bg-slate-800 text-slate-300 hover:bg-slate-700' : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={`block text-xs sm:text-sm font-semibold mb-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  Sprint Name *
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sprint 1"
                  required
                  className={`w-full border rounded-xl p-3 outline-none transition duration-200 font-medium text-xs sm:text-base ${
                    isDarkMode 
                      ? 'bg-slate-950 text-white placeholder-slate-500 border-slate-700 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20' 
                      : 'bg-white text-slate-900 placeholder-slate-400 border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs sm:text-sm font-semibold mb-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  Goal
                </label>
                <input
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="What do we want to achieve?"
                  className={`w-full border rounded-xl p-3 outline-none transition duration-200 font-medium text-xs sm:text-base ${
                    isDarkMode 
                      ? 'bg-slate-950 text-white placeholder-slate-500 border-slate-700 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20' 
                      : 'bg-white text-slate-900 placeholder-slate-400 border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs sm:text-sm font-semibold mb-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full border rounded-xl p-3 outline-none transition duration-200 font-medium text-xs sm:text-base ${
                    isDarkMode 
                      ? 'bg-slate-950 text-white border-slate-700 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20' 
                      : 'bg-white text-slate-900 border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs sm:text-sm font-semibold mb-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full border rounded-xl p-3 outline-none transition duration-200 font-medium text-xs sm:text-base ${
                    isDarkMode 
                      ? 'bg-slate-950 text-white border-slate-700 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20' 
                      : 'bg-white text-slate-900 border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                  }`}
                />
              </div>
            </div>

            {!editingSprint && backlogTodos.length > 0 && (
              <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
                <h3 className={`mb-2.5 font-bold text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Select Backlog Tasks
                </h3>

                <div className={`max-h-52 space-y-2 overflow-y-auto rounded-2xl border p-2.5 ${
                  isDarkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
                }`}>
                  {backlogTodos.map((todo) => (
                    <label
                      key={todo.id}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 transition ${
                        isDarkMode 
                          ? 'border-slate-800 bg-slate-900 hover:border-indigo-500/50 text-white' 
                          : 'border-slate-200 bg-white hover:border-indigo-500/50 text-slate-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTodoIds.includes(todo.id)}
                        onChange={(e) => {
                          setSelectedTodoIds((current) =>
                            e.target.checked
                              ? [...current, todo.id]
                              : current.filter((id) => id !== todo.id)
                          );
                        }}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-700 focus:ring-indigo-500 shrink-0"
                      />

                      <span className="flex-1 font-semibold text-xs sm:text-sm break-words">{todo.title}</span>

                      <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 ${
                        isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {todo.priority}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-600/25 disabled:opacity-50 transition flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                    <span>Saving...</span>
                  </>
                ) : editingSprint ? (
                  'Save Changes'
                ) : (
                  'Create Sprint'
                )}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className={`w-full sm:w-auto rounded-xl border px-5 py-3 font-semibold transition text-center text-xs sm:text-sm ${
                  isDarkMode 
                    ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' 
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Sprint Grid */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {sprints.map((sprint) => (
            <div
              key={sprint.id}
              className={`rounded-2xl border p-4 sm:p-6 shadow-sm transition-all duration-300 flex flex-col justify-between ${
                selectedSprint?.id === sprint.id
                  ? isDarkMode 
                    ? 'border-indigo-500 bg-slate-900 shadow-lg shadow-indigo-950/50 ring-2 ring-indigo-500/20' 
                    : 'border-indigo-500 bg-white shadow-lg shadow-indigo-100 ring-2 ring-indigo-500/10'
                  : isDarkMode 
                    ? 'border-slate-800 bg-slate-900 hover:border-slate-700' 
                    : 'border-slate-200 bg-white hover:border-indigo-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2.5 mb-2.5">
                  <div className="min-w-0 flex-1">
                    <h2 className={`text-base sm:text-xl font-extrabold tracking-tight break-words ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {sprint.name}
                    </h2>
                    <p className={`mt-0.5 text-xs sm:text-sm font-normal break-words ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                      {sprint.goal || 'No sprint goal provided'}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider shrink-0 ${
                      sprint.status === 'active'
                        ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                        : sprint.status === 'completed'
                          ? 'bg-blue-500/15 text-blue-500 border border-blue-500/30'
                          : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                    }`}
                  >
                    {sprint.status}
                  </span>
                </div>

                <div className="my-3 sm:my-4 grid grid-cols-2 gap-2 text-xs sm:text-sm">
                  <div className={`rounded-xl border p-2.5 ${isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200/60 bg-slate-50'}`}>
                    <p className={`text-[10px] font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Start Date</p>
                    <p className={`mt-0.5 font-semibold text-xs ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      {sprint.startDate
                        ? new Date(sprint.startDate).toLocaleDateString()
                        : 'Not set'}
                    </p>
                  </div>

                  <div className={`rounded-xl border p-2.5 ${isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200/60 bg-slate-50'}`}>
                    <p className={`text-[10px] font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>End Date</p>
                    <p className={`mt-0.5 font-semibold text-xs ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      {sprint.endDate
                        ? new Date(sprint.endDate).toLocaleDateString()
                        : 'Not set'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fully Responsive Action Buttons Container */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleOpenBoard(sprint)}
                  className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 text-xs font-bold shadow-sm transition"
                >
                  <Eye size={14} className="shrink-0" />
                  <span>View Tasks</span>
                </button>

                {sprint.status === 'planned' && (
                  <>
                    <button
                      onClick={() => openEditForm(sprint)}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                        isDarkMode 
                          ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' 
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Edit3 size={14} className="shrink-0" />
                      <span>Edit</span>
                    </button>
                    
                    <button
                      onClick={() => handleStartSprint(sprint)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 text-xs font-bold shadow-sm transition"
                    >
                      <Play size={14} className="shrink-0" />
                      <span>Start</span>
                    </button>

                    <button
                      onClick={() => handleDeleteSprint(sprint)}
                      className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/20 px-3 py-2 text-xs font-bold transition"
                    >
                      <Trash2 size={14} className="shrink-0" />
                      <span>Delete</span>
                    </button>
                  </>
                )}

                {sprint.status === 'active' && (
                  <button
                    onClick={() => handleCompleteSprint(sprint)}
                    className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs font-bold shadow-sm transition"
                  >
                    <CheckCircle2 size={14} className="shrink-0" />
                    <span>Complete Sprint</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {sprints.length === 0 && (
          <div className={`rounded-3xl border border-dashed p-8 sm:p-12 text-center shadow-sm ${
            isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-300 bg-white'
          }`}>
            <Target className="mx-auto text-slate-400 mb-3" size={40} />
            <h2 className={`text-base sm:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>No Sprints Yet</h2>
            <p className={`mt-1 text-xs sm:text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
              Create your first sprint to start planning your work effectively.
            </p>
            <button
              onClick={openCreateForm}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 font-semibold shadow-md transition text-xs sm:text-sm"
            >
              <Plus size={16} />
              <span>Create Sprint</span>
            </button>
          </div>
        )}

        {/* Selected Sprint Board Section */}
        {selectedSprint && (
          <section className={`mt-6 sm:mt-10 rounded-2xl sm:rounded-3xl border p-4 sm:p-8 shadow-xl ${
            isDarkMode ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-900'
          }`}>
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="min-w-0">
                <h2 className={`text-lg sm:text-2xl font-extrabold tracking-tight break-words ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {selectedSprint.name} – Tasks
                </h2>
                <p className={`mt-0.5 text-xs sm:text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                  Manage tasks assigned to this sprint
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedSprint(null);
                  setBoard(null);
                }}
                className={`self-start sm:self-auto rounded-xl border px-3.5 py-1.5 text-xs sm:text-sm font-bold transition ${
                  isDarkMode 
                    ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' 
                    : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Close Board
              </button>
            </div>

            {!board ? (
              <p className={`py-4 font-semibold text-xs sm:text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Loading sprint tasks...</p>
            ) : (
              <>
                <div className="space-y-2.5">
                  {boardTodos.map((todo) => (
                    <div
                      key={todo.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-2xl border p-3.5 transition ${
                        isDarkMode ? 'border-slate-800 bg-slate-950/80 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs sm:text-base break-words">{todo.title}</p>
                        <p className={`mt-0.5 text-[11px] sm:text-xs font-semibold break-all ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {todo.key} · <span className="uppercase">{todo.status}</span> · {todo.priority}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemoveTodo(todo)}
                        className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/20 px-3.5 py-2 text-xs font-bold transition shrink-0"
                      >
                        Move to Backlog
                      </button>
                    </div>
                  ))}

                  {boardTodos.length === 0 && (
                    <p className={`py-6 text-center font-semibold text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      No tasks in this sprint yet.
                    </p>
                  )}
                </div>

                {selectedSprint.status === 'planned' && (
                  <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-5">
                    <h3 className={`mb-3 text-sm sm:text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Add Backlog Tasks
                    </h3>
                    {backlogTodos.length === 0 ? (
                      <p className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Your backlog is currently empty.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {backlogTodos.map((todo) => (
                          <div
                            key={todo.id}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-2xl border p-3.5 transition ${
                              isDarkMode ? 'border-slate-800 bg-slate-950/80 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-xs sm:text-base break-words">{todo.title}</p>
                              <p className={`text-[11px] sm:text-xs font-semibold mt-0.5 break-all ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                {todo.priority} · {todo.type}
                              </p>
                            </div>

                            <button
                              onClick={() => handleAddTodo(todo)}
                              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 text-xs font-bold shadow-sm transition shrink-0"
                            >
                              + Add to Sprint
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </section>
        )}

      </main>
    </div>
  );
}