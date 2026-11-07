import { apiRequest } from './api';
import type {
  Sprint,
  CreateSprintRequest,
  UpdateSprintRequest,
  SprintBoardResponse,
} from '../types/api';

export async function getProjectSprints(
  projectId: string
): Promise<Sprint[]> {
  const data = await apiRequest<{ sprints: Sprint[] }>(
    `/projects/${projectId}/sprints`
  );

  return data.sprints;
}

export async function createSprint(
  projectId: string,
  sprint: CreateSprintRequest
): Promise<Sprint> {
  const data = await apiRequest<{ sprint: Sprint }>(
    `/projects/${projectId}/sprints`,
    {
      method: 'POST',
      body: JSON.stringify(sprint),
    }
  );

  return data.sprint;
}

export async function getSprint(
  sprintId: string
): Promise<Sprint> {
  const data = await apiRequest<{ sprint: Sprint }>(
    `/sprints/${sprintId}`
  );

  return data.sprint;
}

export async function getSprintBoard(
  sprintId: string
): Promise<SprintBoardResponse> {
  return apiRequest<SprintBoardResponse>(
    `/sprints/${sprintId}/todos`
  );
}

export async function updateSprint(
  sprintId: string,
  updates: UpdateSprintRequest
): Promise<Sprint> {
  const data = await apiRequest<{ sprint: Sprint }>(
    `/sprints/${sprintId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }
  );

  return data.sprint;
}

export async function deleteSprint(
  sprintId: string
): Promise<void> {
  await apiRequest(`/sprints/${sprintId}`, {
    method: 'DELETE',
  });
}

export async function startSprint(
  sprintId: string,
  dates?: {
    startDate?: string;
    endDate?: string;
  }
): Promise<Sprint> {
  const data = await apiRequest<{ sprint: Sprint }>(
    `/sprints/${sprintId}/start`,
    {
      method: 'POST',
      body: JSON.stringify(dates ?? {}),
    }
  );

  return data.sprint;
}

export async function completeSprint(
  sprintId: string,
  moveUnfinishedTo: string = 'backlog'
): Promise<Sprint> {
  const data = await apiRequest<{ sprint: Sprint }>(
    `/sprints/${sprintId}/complete`,
    {
      method: 'POST',
      body: JSON.stringify({ moveUnfinishedTo }),
    }
  );

  return data.sprint;
}