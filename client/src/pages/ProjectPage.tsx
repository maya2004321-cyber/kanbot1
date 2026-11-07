import { useEffect, useState } from 'react';
import { createProject, getProjects, updateProject, deleteProject } from '../services/projects';
import type { ProjectWithStats } from '../types/api';
import { useNavigate } from 'react-router';
import Navbar from '../components/Navbar';
import { FolderKanban, Plus, Sun, Moon, X, AlertCircle, Pencil, Trash2, Check } from 'lucide-react';

function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  // States added for Edit & Delete features
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [updating, setUpdating] = useState(false);

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

  async function loadProjects() {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function handleCreateProject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    setError('');

    try {
      const project = await createProject({ name, description });
      setProjects((current) => [project, ...current]);
      setName('');
      setDescription('');
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setCreating(false);
    }
  }

  // Handle Update Project
  async function handleUpdateProject(e: React.FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    setUpdating(true);
    setError('');

    try {
      const updated = await updateProject(id, { name: editName, description: editDescription });
      setProjects((current) =>
        current.map((p) => (p.id === id ? { ...p, name: updated.name, description: updated.description } : p))
      );
      setEditingProjectId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
    } finally {
      setUpdating(false);
    }
  }

  // Handle Delete Project
  async function handleDeleteProject(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await deleteProject(id);
      setProjects((current) => current.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 font-semibold text-base sm:text-lg">
            <span className="w-6 h-6 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin shrink-0" />
            <span>Loading projects...</span>
          </div>
        </div>
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
                <FolderKanban size={24} className="sm:w-[26px] sm:h-[26px]" />
              </div>
              <span className="truncate">My Projects</span>
            </h1>
            <p className={`mt-2 text-sm sm:text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
              Manage your software projects and track their progress efficiently.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-3 rounded-xl border shadow-sm transition flex items-center justify-center gap-2 font-semibold text-sm flex-1 sm:flex-initial ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800' 
                  : 'bg-white border-slate-200 text-indigo-600 hover:bg-slate-100'
              }`}
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 px-5 py-3.5 font-semibold text-white shadow-lg shadow-indigo-600/25 transition duration-200 flex-1 sm:flex-initial text-sm whitespace-nowrap"
            >
              <Plus size={18} />
              <span>Create Project</span>
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className={`mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-4 text-sm font-semibold shadow-sm ${
            isDarkMode 
              ? 'bg-red-950/60 border-red-900/60 text-red-300' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <AlertCircle size={20} className="text-red-500 shrink-0" />
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

        {/* Create Form */}
        {showForm && (
          <form
            onSubmit={handleCreateProject}
            className={`mb-8 rounded-2xl sm:rounded-3xl border p-5 sm:p-8 shadow-xl transition-all max-w-xl ${
              isDarkMode 
                ? 'border-slate-800 bg-slate-900 text-white shadow-black/40' 
                : 'border-slate-200 bg-white text-slate-900 shadow-slate-200/50'
            }`}
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">New Project</h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className={`p-1.5 rounded-xl border transition ${isDarkMode ? 'border-slate-800 bg-slate-800 text-slate-300 hover:bg-slate-700' : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  Project Name *
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={80}
                  placeholder="Enter project name"
                  className={`w-full border rounded-xl p-3.5 outline-none transition duration-200 font-medium text-sm sm:text-base ${
                    isDarkMode 
                      ? 'bg-slate-950 text-white placeholder-slate-500 border-slate-700 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20' 
                      : 'bg-white text-slate-900 placeholder-slate-400 border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  placeholder="Enter project description"
                  rows={3}
                  className={`w-full border rounded-xl p-3.5 outline-none transition duration-200 font-medium text-sm sm:text-base ${
                    isDarkMode 
                      ? 'bg-slate-950 text-white placeholder-slate-500 border-slate-700 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20' 
                      : 'bg-white text-slate-900 placeholder-slate-400 border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                  }`}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={creating}
                className="w-full sm:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 px-6 py-3.5 font-semibold text-white shadow-lg shadow-indigo-600/25 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                    <span>Creating...</span>
                  </>
                ) : (
                  'Create Project'
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className={`w-full sm:w-auto rounded-xl border px-6 py-3.5 font-semibold transition text-center ${
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

        {/* Projects List Grid */}
        {projects.length === 0 ? (
          <div className={`rounded-3xl border border-dashed p-10 sm:p-12 text-center shadow-sm ${
            isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-300 bg-white'
          }`}>
            <FolderKanban className="mx-auto text-slate-400 mb-3" size={48} />
            <h2 className={`text-lg sm:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>No Projects Yet</h2>
            <p className={`mt-1 text-xs sm:text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
              Get started by creating your first project.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 font-semibold shadow-md transition text-sm"
            >
              <Plus size={18} />
              <span>Create Project</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => {
                  if (editingProjectId !== project.id) {
                    navigate('/projects/' + project.id + '/backlog');
                  }
                }}
                className={`cursor-pointer rounded-2xl border p-5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between ${
                  isDarkMode 
                    ? 'border-slate-800 bg-slate-900 hover:border-indigo-500/50 text-white' 
                    : 'border-slate-200 bg-white hover:border-indigo-400 text-slate-900'
                }`}
              >
                {editingProjectId === project.id ? (
                  <form onSubmit={(e) => handleUpdateProject(e, project.id)} onClick={(e) => e.stopPropagation()} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Edit Project</span>
                      <button
                        type="button"
                        onClick={() => setEditingProjectId(null)}
                        className="p-1 rounded-lg hover:bg-slate-700/20 text-slate-400"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      maxLength={80}
                      className={`w-full border rounded-lg p-2.5 text-xs sm:text-sm outline-none ${
                        isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                      placeholder="Project Name"
                    />

                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      maxLength={500}
                      rows={2}
                      className={`w-full border rounded-lg p-2.5 text-xs sm:text-sm outline-none ${
                        isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                      placeholder="Project Description"
                    />

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={updating}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 shadow"
                      >
                        <Check size={14} />
                        <span>{updating ? 'Saving...' : 'Save'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProjectId(null)}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${
                          isDarkMode ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400 break-words">
                          {project.name}
                        </h2>

                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProjectId(project.id);
                              setEditName(project.name);
                              setEditDescription(project.description || '');
                            }}
                            className={`p-2 rounded-xl border transition ${
                              isDarkMode 
                                ? 'border-slate-800 bg-slate-800/80 text-slate-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600' 
                                : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600'
                            }`}
                            title="Edit Project"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteProject(e, project.id)}
                            className={`p-2 rounded-xl border transition ${
                              isDarkMode 
                                ? 'border-slate-800 bg-slate-800/80 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-600' 
                                : 'border-slate-200 bg-slate-100 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600'
                            }`}
                            title="Delete Project"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      <p className={`mt-2 text-xs sm:text-sm break-words ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                        {project.description || 'No description'}
                      </p>
                    </div>

                    <div className={`mt-6 pt-4 border-t flex justify-between text-xs sm:text-sm font-semibold ${
                      isDarkMode ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-600'
                    }`}>
                      <span className={`px-2.5 py-1 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        Backlog: {project.stats.backlogCount}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        Todos: {project.stats.totalTodos}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default ProjectsPage;