import { apiRequest } from './api';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIChatResponse {
  message: AIMessage;
  source: 'ai' | 'mock';
}

export async function sendAIMessage(
  projectId: string,
  messages: AIMessage[]
): Promise<string> {
  const data = await apiRequest<AIChatResponse>(
    `/projects/${projectId}/ai/chat`,
    {
      method: 'POST',
      body: JSON.stringify({ messages }),
    }
  );

  return data.message.content;
}