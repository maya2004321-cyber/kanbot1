import { apiRequest } from './api';

import type {
  Todo,
  TodoListResponse,
  CreateTodoRequest,
  UpdateTodoRequest,
} from '../types/api';

export async function getBacklogTodos(
  projectId: string
): Promise<Todo[]> {
  const data = await apiRequest<TodoListResponse>(
    `/projects/${projectId}/todos?sprintId=backlog`
  );

  return data.todos;
}

export async function createTodo(
  projectId: string,
  todo: CreateTodoRequest
): Promise<Todo> {
  const data = await apiRequest<{ todo: Todo }>(
    `/projects/${projectId}/todos`,
    {
      method: 'POST',
      body: JSON.stringify(todo),
    }
  );

  return data.todo;
}

export async function updateTodo(
  todoId: string,
  updates: UpdateTodoRequest
): Promise<Todo> {
  const data = await apiRequest<{ todo: Todo }>(
    `/todos/${todoId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }
  );

  return data.todo;
}

export async function deleteTodo(
  todoId: string
): Promise<void> {
  await apiRequest(
   `/todos/${todoId}`,
    {
      method: 'DELETE',
    }
  );
}
export async function getProjectTodos(projectId: string): Promise<Todo[]> {
  const data = await apiRequest<{ todos: Todo[] }>(
    `/projects/${projectId}/todos`
  );

  return data.todos;
}