import { useCallback, useEffect, useMemo, useState } from 'react';

import Navbar from '../components/Navbar';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';

import {
  getProjectTodos,
  updateTodo,
} from '../services/todo';

import type {
  Todo,
  TodoStatus,
  TodoPriority,
  TodoType,
  StoryPoints,
  UpdateTodoRequest,
} from '../types/api';

import { Sun, Moon } from 'lucide-react';

const columns: {
  id: TodoStatus;
  title: string;
  color: string;
}[] = [
  {
    id: 'todo',
    title: 'To Do',
    color: 'border-slate-500',
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    color: 'border-blue-500',
  },
  {
    id: 'in_review',
    title: 'In Review',
    color: 'border-purple-500',
  },
  {
    id: 'done',
    title: 'Done',
    color: 'border-green-500',
  },
];


const priorityColors: Record<TodoPriority, string> = {
  low: 'bg-slate-700 text-slate-300',
  medium: 'bg-yellow-500/20 text-yellow-400',
  high: 'bg-orange-500/20 text-orange-400',
  urgent: 'bg-red-500/20 text-red-400',
};

function TaskCard({
  todo,
  onEdit,
  overlay = false,
  isDarkMode,
}: {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  overlay?: boolean;
  isDarkMode: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: todo.id,
    disabled: overlay,
  });

  const style = transform && !overlay
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`rounded-xl border p-4 shadow-sm transition ${
        isDarkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-white text-slate-900 shadow-sm'
      } ${
        isDragging && !overlay
          ? 'opacity-30'
          : 'opacity-100'
      } ${
        overlay
          ? 'rotate-2 shadow-2xl'
          : 'cursor-grab active:cursor-grabbing hover:border-indigo-500'
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="text-xs font-semibold text-indigo-400">
          {todo.key}
        </span>

        <span
          className={`rounded-full px-2 py-1 text-xs font-semibold ${
            priorityColors[todo.priority]
          }`}
        >
          {todo.priority}
        </span>
      </div>

      <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'} break-words text-sm sm:text-base`}>
        {todo.title}
      </h3>

      {todo.description && (
        <p className={`mt-2 line-clamp-2 text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} break-words`}>
          {todo.description}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={`rounded px-2 py-1 text-xs ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
          {todo.type}
        </span>

        {todo.storyPoints != null && (
          <span className="rounded bg-indigo-500/20 px-2 py-1 text-xs text-indigo-300">
            {todo.storyPoints} SP
          </span>
        )}
      </div>

      {todo.labels?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {todo.labels.map((label) => (
            <span
              key={label}
              className={`rounded-full px-2 py-1 text-xs ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'} break-all`}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      <div className={`mt-4 border-t pt-3 ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onEdit(todo);
          }}
          className="text-xs sm:text-sm font-medium text-indigo-400 hover:text-indigo-300"
        >
          Edit Task
        </button>
      </div>
    </div>
  );
}

function BoardColumn({
  column,
  todos,
  onEdit,
  isDarkMode,
}: {
  column: (typeof columns)[number];
  todos: Todo[];
  onEdit: (todo: Todo) => void;
  isDarkMode: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[450px] rounded-xl border-t-4 p-4 transition ${
        column.color
      } ${
        isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 border border-slate-200 shadow-sm'
      } ${
        isOver ? (isDarkMode ? 'bg-indigo-950/40 ring-2 ring-indigo-500' : 'bg-indigo-50 ring-2 ring-indigo-400') : ''
      }`}
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} text-sm sm:text-base`}>
          {column.title}
        </h2>

        <span className={`rounded-full px-3 py-1 text-xs sm:text-sm ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
          {todos.length}
        </span>
      </div>

      <div className="space-y-3">
        {todos.map((todo) => (
          <TaskCard
            key={todo.id}
            todo={todo}
            onEdit={onEdit}
            isDarkMode={isDarkMode}
          />
        ))}

        {todos.length === 0 && (
          <div className={`rounded-lg border border-dashed p-6 text-center text-xs sm:text-sm ${isDarkMode ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}

export default function BoardPage({
  projectId,
}: {
  projectId: string;
}) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);

  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [saving, setSaving] = useState(false);

  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<TodoPriority>('medium');
  const [editType, setEditType] = useState<TodoType>('task');
  const [editPoints, setEditPoints] = useState<StoryPoints | null>(null);
  const [editLabels, setEditLabels] = useState('');

  // Theme Controller State & Synchronizer
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const loadTodos = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const result = await getProjectTodos(projectId);
      setTodos(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load board'
      );
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadTodos();
  }, [loadTodos]);

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      const matchesSearch =
        todo.title.toLowerCase().includes(search.toLowerCase()) ||
        todo.key.toLowerCase().includes(search.toLowerCase()) ||
        (todo.description ?? '').toLowerCase().includes(search.toLowerCase());

      const matchesPriority =
        priorityFilter === 'all' ||
        todo.priority === priorityFilter;

      const matchesType =
        typeFilter === 'all' ||
        todo.type === typeFilter;

      return matchesSearch && matchesPriority && matchesType;
    });
  }, [todos, search, priorityFilter, typeFilter]);

  const stats = useMemo(() => {
    return {
      total: todos.length,
      todo: todos.filter((t) => t.status === 'todo').length,
      inProgress: todos.filter((t) => t.status === 'in_progress').length,
      inReview: todos.filter((t) => t.status === 'in_review').length,
      done: todos.filter((t) => t.status === 'done').length,
    };
  }, [todos]);

  const openEditModal = (todo: Todo) => {
    setEditingTodo(todo);
    setEditTitle(todo.title);
    setEditDescription(todo.description ?? '');
    setEditPriority(todo.priority);
    setEditType(todo.type);
    setEditPoints(todo.storyPoints);
    setEditLabels(todo.labels.join(', '));
  };

  const handleSaveEdit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!editingTodo || !editTitle.trim()) return;
    const updates: UpdateTodoRequest = {
      title: editTitle.trim(),
      description: editDescription.trim(),
      priority: editPriority,
      type: editType,
      storyPoints: editPoints,
      labels: editLabels
        .split(',')
        .map((label) => label.trim())
        .filter(Boolean),
    };

    setSaving(true);
    setError('');

    try {
      const updated = await updateTodo(editingTodo.id, updates);

      setTodos((current) =>
        current.map((todo) =>
          todo.id === updated.id ? updated : todo
        )
      );

      setEditingTodo(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update task'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDragStart = (event: {
    active: { id: string | number };
  }) => {
    const todo = todos.find(
      (item) => item.id === String(event.active.id)
    );

    setActiveTodo(todo ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTodo(null);

    const { active, over } = event;

    if (!over) return;

    const todo = todos.find(
      (item) => item.id === String(active.id)
    );

    if (!todo) return;

    const targetStatus = String(over.id) as TodoStatus;

    const validStatus = columns.some(
      (column) => column.id === targetStatus
    );

    if (!validStatus || todo.status === targetStatus) return;

    const previousTodos = todos;

    setTodos((current) =>
      current.map((item) =>
        item.id === todo.id
          ? { ...item, status: targetStatus }
          : item
      )
    );

    try {
      await updateTodo(todo.id, {
        status: targetStatus,
      });
    } catch (err) {
      setTodos(previousTodos);

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to move task'
      );
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <header className="sticky top-0 z-50">
          <Navbar />
        </header>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="flex items-center gap-3 font-semibold text-sm sm:text-base">
            <span className="w-6 h-6 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin shrink-0" />
            <span>Loading Kanban Board...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <header className="sticky top-0 z-50">
        <Navbar />
      </header>

      <div className="flex-1 p-3 sm:p-6 lg:p-8 overflow-x-hidden">
        <div className="mx-auto max-w-[1600px]">

          {/* Header */}
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">
                Kanban Board
              </h1>

              <p className={`mt-1 text-xs sm:text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Manage your tasks visually and track their progress.
              </p>
            </div>

            {/* Theme Toggle Button */}
            <div className="flex justify-end sm:justify-start">
              <button
                type="button"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`w-full sm:w-auto p-2.5 sm:p-3 rounded-xl border shadow-sm transition flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-800' 
                    : 'bg-white border-slate-200 text-indigo-600 hover:bg-slate-100'
                }`}
                aria-label="Toggle Theme"
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300">
              <span className="text-xs sm:text-sm break-all">{error}</span>

              <button
                onClick={() => setError('')}
                className="font-bold shrink-0"
              >
                ✕
              </button>
            </div>
          )}

          {/* Statistics */}
          <div className="mb-6 sm:mb-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-5">
            {[
              { label: 'Total Tasks', value: stats.total },
              { label: 'To Do', value: stats.todo },
              { label: 'In Progress', value: stats.inProgress },
              { label: 'In Review', value: stats.inReview },
              { label: 'Done', value: stats.done },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-xl border p-4 sm:p-5 shadow-sm ${
                  isDarkMode ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-900 shadow-sm'
                }`}
              >
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {item.label}
                </p>

                <p className="mt-2 text-2xl sm:text-3xl font-bold">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className={`mb-6 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:flex-wrap ${
            isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white shadow-sm'
          }`}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className={`w-full min-w-0 flex-1 rounded-lg border px-4 py-3 text-xs sm:text-sm outline-none focus:border-indigo-500 ${
                isDarkMode ? 'border-slate-700 bg-slate-800 text-white placeholder-slate-400' : 'border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400'
              }`}
            />

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className={`w-full rounded-lg border px-4 py-3 text-xs sm:text-sm sm:w-auto outline-none ${
                isDarkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
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
              className={`w-full rounded-lg border px-4 py-3 text-xs sm:text-sm sm:w-auto outline-none ${
                isDarkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
              }`}
            >
              <option value="all">All Types</option>
              <option value="task">Task</option>
              <option value="story">Story</option>
              <option value="bug">Bug</option>
            </select>

            <button
              onClick={() => {
                setSearch('');
                setPriorityFilter('all');
                setTypeFilter('all');
              }}
              className={`w-full rounded-lg px-4 py-3 text-xs sm:text-sm transition sm:w-auto ${
                isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold'
              }`}
            >
              Clear Filters
            </button>
          </div>

          <p className={`mb-4 text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Showing {filteredTodos.length} of {todos.length} tasks
          </p>

          {/* Kanban Board */}
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveTodo(null)}
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {columns.map((column) => (
                <BoardColumn
                  key={column.id}
                  column={column}
                  todos={filteredTodos.filter(
                    (todo) => todo.status === column.id
                  )}
                  onEdit={openEditModal}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>

            <DragOverlay>
              {activeTodo ? (
                <TaskCard
                  todo={activeTodo}
                  onEdit={() => {}}
                  overlay
                  isDarkMode={isDarkMode}
                />
              ) : null}
            </DragOverlay>
          </DndContext>

          {/* Edit Modal */}
          {editingTodo && (
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
              <form
                onSubmit={handleSaveEdit}
                className={`my-8 w-full max-w-xl rounded-2xl border p-5 sm:p-6 shadow-xl ${
                  isDarkMode ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-900'
                }`}
              >
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold">
                    Edit Task
                  </h2>

                  <button
                    type="button"
                    onClick={() => setEditingTodo(null)}
                    className={`text-xl ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`mb-2 block text-xs sm:text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700 font-semibold'}`}>
                      Title
                    </label>
                    <input
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className={`w-full rounded-lg border px-4 py-3 text-xs sm:text-sm outline-none ${
                        isDarkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`mb-2 block text-xs sm:text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700 font-semibold'}`}>
                      Description
                    </label>

                    <textarea
                      rows={3}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className={`w-full rounded-lg border px-4 py-3 text-xs sm:text-sm outline-none ${
                        isDarkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={`mb-2 block text-xs sm:text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700 font-semibold'}`}>
                        Priority
                      </label>

                      <select
                        value={editPriority}
                        onChange={(e) =>
                          setEditPriority(e.target.value as TodoPriority)
                        }
                        className={`w-full rounded-lg border px-3 py-3 text-xs sm:text-sm outline-none ${
                          isDarkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                        }`}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    <div>
                      <label className={`mb-2 block text-xs sm:text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700 font-semibold'}`}>
                        Type
                      </label>

                      <select
                        value={editType}
                        onChange={(e) =>
                          setEditType(e.target.value as TodoType)
                        }
                        className={`w-full rounded-lg border px-3 py-3 text-xs sm:text-sm outline-none ${
                          isDarkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                        }`}
                      >
                        <option value="task">Task</option>
                        <option value="story">Story</option>
                        <option value="bug">Bug</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={`mb-2 block text-xs sm:text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700 font-semibold'}`}>
                      Story Points
                    </label>

                    <select
                      value={editPoints ?? ''}
                      onChange={(e) =>
                        setEditPoints(
                          e.target.value
                            ? Number(e.target.value) as StoryPoints
                            : null
                        )
                      }
                      className={`w-full rounded-lg border px-4 py-3 text-xs sm:text-sm outline-none ${
                        isDarkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                      }`}
                    >
                      <option value="">No Story Points</option>
                      {[1, 2, 3, 5, 8, 13].map((point) => (
                        <option key={point} value={point}>
                          {point}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`mb-2 block text-xs sm:text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700 font-semibold'}`}>
                      Labels (comma separated)
                    </label>

                    <input
                      value={editLabels}
                      onChange={(e) => setEditLabels(e.target.value)}
                      placeholder="frontend, urgent, design"
                      className={`w-full rounded-lg border px-4 py-3 text-xs sm:text-sm outline-none ${
                        isDarkMode ? 'border-slate-700 bg-slate-800 text-white placeholder-slate-500' : 'border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={saving || !editTitle.trim()}
                    className="flex-1 rounded-lg bg-indigo-600 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingTodo(null)}
                    className={`w-full rounded-lg px-5 py-3 text-xs sm:text-sm transition sm:w-auto ${
                      isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}