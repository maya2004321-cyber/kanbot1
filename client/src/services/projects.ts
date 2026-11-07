import { apiRequest } from './api';
import type { ProjectWithStats } from '../types/api';

export async function getProjects(): Promise<ProjectWithStats[]> {
  const data = await apiRequest<{
    projects: ProjectWithStats[];
  }>('/projects');

  return data.projects;
}
//add new project
export async function createProject(data: {
  name: string;
  key?: string;
  description?: string;
}): Promise<ProjectWithStats> {
  const result = await apiRequest<{
    project: ProjectWithStats;
  }>('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return result.project;
}
// أضف هاتين الدالتين إلى ملف src/services/projects.ts إذا لم تكونا موجودتين:

export async function updateProject(id: string, data: { name: string; description?: string }) {
  return apiRequest<ProjectWithStats>(`/projects/${id}`, {
    method: 'PATCH', // جرب تغييرها إلى PATCH بدلاً من PUT
    body: JSON.stringify(data),
  });
}

export async function deleteProject(id: string) {
  return apiRequest<void>(`/projects/${id}`, {
    method: 'DELETE',
  });
}