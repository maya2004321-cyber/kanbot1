import { useEffect, useMemo, useState } from 'react';

import {
  getBacklogTodos,
  createTodo,
  deleteTodo,
  updateTodo,
} from '../services/todo';

import type {
  Todo,
  TodoPriority,
  TodoType,
  StoryPoints,
} from '../types/api';

interface BacklogPageProps {
  projectId: string;
}

import Navbar from '../components/Navbar';
import { CheckSquare, Plus, Search, AlertCircle, Trash2, Edit3, X, Calendar, Sun, Moon } from 'lucide-react';

function BacklogPage({ projectId }: BacklogPageProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TodoPriority>('medium');
  const [type, setType] = useState<TodoType>('task');
  const [storyPoints, setStoryPoints] = useState<StoryPoints | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [labels, setLabels] = useState('');

  const [creating, setCreating] = useState(false);

  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<TodoPriority>('medium');
  const [editType, setEditType] = useState<TodoType>('task');
  const [editStoryPoints, setEditStoryPoints] = useState<StoryPoints | null>(null);
  const [editDueDate, setEditDueDate] = useState('');
  const [editLabels, setEditLabels] = useState('');

  const [savingEdit, setSavingEdit] = useState(false);

  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Theme Toggle State & Synchronizer
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

  async function loadTodos() {
    try {
      setLoading(true);
      setError('');

      const data = await getBacklogTodos(projectId);

      setTodos(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load tasks'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTodos();
  }, [projectId]);

  async function handleCreateTodo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title.trim()) return;

    setCreating(true);
    setError('');

    try {
      const newTodo = await createTodo(projectId, {
        title: title.trim(),
        description: description.trim(),
        priority,
        type,
        storyPoints,
        dueDate: dueDate || null,
        labels: labels
          .split(',')
          .map((label) => label.trim())
          .filter(Boolean),
      });

      setTodos((current) => [...current, newTodo]);

      setTitle('');
      setDescription('');
      setPriority('medium');
      setType('task');
      setStoryPoints(null);
      setDueDate('');
      setLabels('');

      setShowForm(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create task'
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteTodo(todoId: string) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this task?'
    );

    if (!confirmed) return;

    setError('');

    try {
      await deleteTodo(todoId);

      setTodos((current) =>
        current.filter((todo) => todo.id !== todoId)
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete task'
      );
    }
  }

  function handleEditTodo(todo: Todo) {
    setEditingTodo(todo);

    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setEditPriority(todo.priority);
    setEditType(todo.type);
    setEditStoryPoints(todo.storyPoints);
    setEditDueDate(todo.dueDate || '');
    setEditLabels((todo.labels || []).join(', '));

    setError('');
  }

  async function handleSaveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!editingTodo || !editTitle.trim()) return;

    setSavingEdit(true);
    setError('');
    try {
      const updatedTodo = await updateTodo(editingTodo.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority,
        type: editType,
        storyPoints: editStoryPoints,
        dueDate: editDueDate || null,
        labels: editLabels
          .split(',')
          .map((label) => label.trim())
          .filter(Boolean),
      });

      setTodos((current) =>
        current.map((item) =>
          item.id === editingTodo.id ? updatedTodo : item
        )
      );

      setEditingTodo(null);
      setEditTitle('');
      setEditDescription('');
      setEditLabels('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update task'
      );
    } finally {
      setSavingEdit(false);
    }
  }

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        todo.title.toLowerCase().includes(searchText) ||
        todo.description.toLowerCase().includes(searchText) ||
        todo.key.toLowerCase().includes(searchText) ||
        (todo.labels || []).some((label) =>
          label.toLowerCase().includes(searchText)
        );

      const matchesPriority =
        priorityFilter === 'all' ||
        todo.priority === priorityFilter;

      const matchesType =
        typeFilter === 'all' ||
        todo.type === typeFilter;

      return matchesSearch && matchesPriority && matchesType;
    });
  }, [todos, search, priorityFilter, typeFilter]);

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 font-semibold text-base sm:text-lg">
            <span className="w-6 h-6 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin shrink-0" />
            <span>Loading backlog...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar />

      <main className="w-full px-4 sm:px-6 lg:px-12 py-6 sm:py-8 max-w-[1600px] mx-auto">

        {/* Header with Theme Toggle */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <div className="bg-indigo-600 text-white p-2.5 rounded-2xl shadow-md shadow-indigo-500/20 shrink-0">
                <CheckSquare size={24} className="sm:w-[26px] sm:h-[26px]" />
              </div>
              Backlog
            </h1>
            <p className={`mt-2 text-sm sm:text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
              Manage your project tasks efficiently.
            </p>
          </div>

          {/* Theme Toggle Button */}
          <div className="flex justify-end sm:justify-start">
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

        {error && (
          <div className={`mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-4 text-sm font-semibold shadow-sm ${
            isDarkMode 
              ? 'bg-red-950/60 border-red-900/60 text-red-300' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <div className="flex items-center gap-2.5">
              <AlertCircle size={20} className="text-red-500 shrink-0" />
              <span className="break-all">{error}</span>
            </div>
            <button
              onClick={loadTodos}
              className={`self-end sm:self-auto rounded-xl px-4 py-2 text-xs font-bold transition ${
                isDarkMode ? 'bg-red-950 text-white hover:bg-red-900 border border-red-800' : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              Retry
            </button>
          </div>
        )}

        <div className={`w-full rounded-2xl sm:rounded-3xl border p-4 sm:p-6 lg:p-8 shadow-xl transition-all ${
          isDarkMode ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-900'
        }`}>

          <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
              Tasks ({todos.length})
            </h2>

            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-600/25 transition duration-200"
            >
              <Plus size={18} />
              {showForm ? 'Cancel' : 'Add Task'}
            </button>
          </div>

          {showForm && (
            <form
              onSubmit={handleCreateTodo}
              className={`mb-8 space-y-4 rounded-2xl border p-4 sm:p-6 shadow-sm transition ${
                isDarkMode ? 'border-slate-800 bg-slate-950 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'
              }`}
            >
              <h3 className="text-base sm:text-lg font-bold">
                Create New Task
              </h3>

              <input
                type="text"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
                className={`w-full border rounded-xl p-3.5 outline-none transition duration-200 font-medium text-sm sm:text-base ${
                  isDarkMode 
                    ? 'bg-slate-900 text-white placeholder-slate-500 border-slate-700 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20' 
                    : 'bg-white text-slate-900 placeholder-slate-400 border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                }`}
              />

              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={5000}
                rows={3}
                className={`w-full border rounded-xl p-3.5 outline-none transition duration-200 font-medium text-sm sm:text-base ${
                  isDarkMode 
                    ? 'bg-slate-900 text-white placeholder-slate-500 border-slate-700 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20' 
                    : 'bg-white text-slate-900 placeholder-slate-400 border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                }`}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as TodoPriority)
                  }
                  className={`w-full border rounded-xl p-3.5 outline-none transition duration-200 font-medium text-sm sm:text-base ${
                    isDarkMode ? 'bg-slate-900 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-300'
                  }`}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent Priority</option>
                </select>

                <select
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value as TodoType)
                  }
                  className={`w-full border rounded-xl p-3.5 outline-none transition duration-200 font-medium text-sm sm:text-base ${
                    isDarkMode ? 'bg-slate-900 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-300'
                  }`}
                >
                  <option value="task">Task</option>
                  <option value="bug">Bug</option>
                  <option value="story">Story</option>
                </select>

                <select
                  value={storyPoints ?? ''}
                  onChange={(e) =>
                    setStoryPoints(
                      e.target.value
                        ? Number(e.target.value) as StoryPoints
                        : null
                    )
                  }
                  className={`w-full border rounded-xl p-3.5 outline-none transition duration-200 font-medium text-sm sm:text-base ${
                    isDarkMode ? 'bg-slate-900 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-300'
                  }`}
                >
                  <option value="">No Story Points</option>
                  {[1, 2, 3, 5, 8, 13].map((point) => (
                    <option key={point} value={point}>
                      {point} Points
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={`w-full border rounded-xl p-3.5 outline-none transition duration-200 font-medium text-sm sm:text-base ${
                    isDarkMode ? 'bg-slate-900 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-300'
                  }`}
                />

                <input
                  type="text"
                  placeholder="Labels (comma separated)"
                  value={labels}
                  onChange={(e) => setLabels(e.target.value)}
                  className={`w-full border rounded-xl p-3.5 outline-none transition duration-200 font-medium text-sm sm:text-base ${
                    isDarkMode ? 'bg-slate-900 text-white placeholder-slate-500 border-slate-700' : 'bg-white text-slate-900 placeholder-slate-400 border-slate-300'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full sm:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-3.5 font-semibold text-white shadow-md shadow-emerald-600/20 disabled:opacity-50 transition"
              >
                {creating ? 'Creating...' : 'Create Task'}
              </button>
            </form>
          )}

          {/* Filters Bar */}
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} size={18} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-11 border rounded-xl p-3.5 outline-none transition duration-200 font-medium text-sm sm:text-base ${
                  isDarkMode 
                    ? 'bg-slate-950 text-white placeholder-slate-500 border-slate-800 focus:border-indigo-400' 
                    : 'bg-white text-slate-900 placeholder-slate-400 border-slate-200 focus:border-indigo-500'
                }`}
              />
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className={`border rounded-xl p-3.5 outline-none transition duration-200 font-medium text-sm sm:text-base ${
                isDarkMode ? 'bg-slate-950 text-white border-slate-800' : 'bg-white text-slate-900 border-slate-200'
              }`}
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={`border rounded-xl p-3.5 outline-none transition duration-200 font-medium text-sm sm:text-base ${
                isDarkMode ? 'bg-slate-950 text-white border-slate-800' : 'bg-white text-slate-900 border-slate-200'
              }`}
            >
              <option value="all">All Types</option>
              <option value="task">Task</option>
              <option value="bug">Bug</option>
              <option value="story">Story</option>
            </select>
          </div>

          {/* Edit Form Modal/Box */}
          {editingTodo && (
            <form
              onSubmit={handleSaveEdit}
              className={`mb-8 space-y-4 rounded-2xl border p-4 sm:p-6 shadow-md ${
                isDarkMode ? 'border-indigo-900/60 bg-indigo-950/40 text-white' : 'border-indigo-200 bg-indigo-50/70 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between pb-2">
                <h3 className="text-base sm:text-lg font-bold break-all">
                  Edit Task – {editingTodo.key}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingTodo(null)}
                  className="p-1.5 rounded-lg hover:bg-indigo-500/10 transition shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
                maxLength={200}
                className={`w-full border rounded-xl p-3.5 outline-none transition font-medium text-sm sm:text-base ${
                  isDarkMode ? 'bg-slate-900 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-300'
                }`}
                placeholder="Task title"
              />

              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                maxLength={5000}
                rows={3}
                className={`w-full border rounded-xl p-3.5 outline-none transition font-medium text-sm sm:text-base ${
                  isDarkMode ? 'bg-slate-900 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-300'
                }`}
                placeholder="Description"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <select
                  value={editPriority}
                  onChange={(e) =>
                    setEditPriority(e.target.value as TodoPriority)
                  }
                  className={`w-full border rounded-xl p-3.5 outline-none transition font-medium text-sm sm:text-base ${
                    isDarkMode ? 'bg-slate-900 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-300'
                  }`}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>

                <select
                  value={editType}
                  onChange={(e) =>
                    setEditType(e.target.value as TodoType)
                  }
                  className={`w-full border rounded-xl p-3.5 outline-none transition font-medium text-sm sm:text-base ${
                    isDarkMode ? 'bg-slate-900 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-300'
                  }`}
                >
                  <option value="task">Task</option>
                  <option value="bug">Bug</option>
                  <option value="story">Story</option>
                </select>

                <select
                  value={editStoryPoints ?? ''}
                  onChange={(e) =>
                    setEditStoryPoints(
                      e.target.value
                        ? Number(e.target.value) as StoryPoints
                        : null
                    )
                  }
                  className={`w-full border rounded-xl p-3.5 outline-none transition font-medium text-sm sm:text-base ${
                    isDarkMode ? 'bg-slate-900 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-300'
                  }`}
                >
                  <option value="">No Story Points</option>
                  {[1, 2, 3, 5, 8, 13].map((point) => (
                    <option key={point} value={point}>
                      {point} Points
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className={`w-full border rounded-xl p-3.5 outline-none transition font-medium text-sm sm:text-base ${
                    isDarkMode ? 'bg-slate-900 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-300'
                  }`}
                />

                <input
                  type="text"
                  value={editLabels}
                  onChange={(e) => setEditLabels(e.target.value)}
                  placeholder="Labels (comma separated)"
                  className={`w-full border rounded-xl p-3.5 outline-none transition font-medium text-sm sm:text-base ${
                    isDarkMode ? 'bg-slate-900 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-300'
                  }`}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="w-full sm:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3.5 font-semibold text-white shadow-md disabled:opacity-50 transition"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>

                <button
                  type="button"
                  onClick={() => setEditingTodo(null)}
                  className={`w-full sm:w-auto rounded-xl border px-6 py-3.5 font-semibold transition ${
                    isDarkMode ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className={`mb-4 text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Showing {filteredTodos.length} of {todos.length} tasks
          </div>

          {filteredTodos.length === 0 ? (
            <div className={`rounded-2xl border border-dashed p-10 sm:p-12 text-center ${
              isDarkMode ? 'border-slate-800 bg-slate-950/50 text-slate-400' : 'border-slate-300 bg-slate-50 text-slate-500'
            }`}>
              <CheckSquare className="mx-auto mb-3 opacity-40" size={40} />
              <p className="font-semibold text-base sm:text-lg">No tasks found.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={`rounded-2xl border p-4 sm:p-5 transition-all duration-200 hover:shadow-md ${
                    isDarkMode 
                      ? 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-white' 
                      : 'border-slate-200 bg-white hover:border-indigo-300 text-slate-900'
                  }`}
                >
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {todo.key}
                      </span>

                      <h3 className="mt-1 text-base sm:text-lg font-bold tracking-tight break-words">
                        {todo.title}
                      </h3>

                      <p className={`mt-1.5 text-xs sm:text-sm break-words ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                        {todo.description || 'No description provided'}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
                          {todo.type}
                        </span>

                        <span className="rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
                          {todo.priority}
                        </span>

                        {todo.labels?.map((label) => (
                          <span
                            key={label}
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold break-all ${
                              isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            #{label}
                          </span>
                        ))}
                      </div>

                      {todo.dueDate && (
                        <p className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          <Calendar size={14} className="shrink-0" />
                          <span>Due: {todo.dueDate}</span>
                        </p>
                      )}
                    </div>

                    {/* Fully Responsive Action Buttons & Points Container */}
                    <div className="flex flex-col sm:flex-row xl:flex-col items-stretch sm:items-center xl:items-end justify-between gap-3 border-t xl:border-t-0 pt-3 xl:pt-0 border-slate-100 dark:border-slate-800 shrink-0 w-full xl:w-auto">
                      <span className={`rounded-xl px-3.5 py-2 text-xs font-bold text-center ${
                        isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {todo.storyPoints ?? '-'} Points
                      </span>

                      <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleEditTodo(todo)}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-sm w-full sm:w-auto"
                        >
                          <Edit3 size={14} className="shrink-0" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/20 px-4 py-2.5 text-xs font-bold transition shadow-sm w-full sm:w-auto"
                        >
                          <Trash2 size={14} className="shrink-0" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </main>
    </div>
  );
}

export default BacklogPage;