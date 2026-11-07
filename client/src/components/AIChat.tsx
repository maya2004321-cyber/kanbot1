import { useState } from 'react';
import { sendAIMessage, type AIMessage } from '../services/ai';

interface AIChatProps {
  projectId: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChat({ projectId }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestions = [
    'Analyze my project',
    'Suggest task priorities',
    'Break down a task',
    'Summarize my sprint',
  ];

  async function handleSend(text?: string) {
    const message = (text ?? input).trim();

    if (!message || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

  setLoading(true);

try {
  const history: AIMessage[] = [...messages, userMessage];

  const response = await sendAIMessage(projectId, history);

  setMessages((prev) => [
    ...prev,
    {
      role: 'assistant',
      content: response,
    },
  ]);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            error instanceof Error
              ? error.message
              : 'Something went wrong while contacting the AI.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[650px] flex-col overflow-hidden rounded-xl border bg-white shadow-sm">
      
      {/* Header */}
      <div className="border-b bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-2xl">
            🤖
          </div>

          <div>
            <h2 className="font-semibold text-gray-800">
              Kanbot AI Assistant
            </h2>

            <p className="text-sm text-gray-500">
              Your intelligent project assistant
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 text-5xl">✨</div>

            <h3 className="text-xl font-semibold text-gray-800">
              How can I help you?
            </h3>

            <p className="mt-2 max-w-md text-sm text-gray-500">
              Ask Kanbot about your project, backlog, tasks, or sprint.
            </p>

            {/* Suggestions */}
            <div className="mt-6 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSend(suggestion)}
                  disabled={loading}
                  className="rounded-lg border px-4 py-3 text-left text-sm text-gray-700 transition hover:border-indigo-400 hover:bg-indigo-50 disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap break-words rounded-xl px-4 py-3 text-sm ${
                  message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-500">
                  Kanbot is thinking...
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSend();
        }}
        className="border-t p-3 sm:p-4"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask Kanbot anything..."
            disabled={loading}
            className="min-w-0 flex-1 rounded-lg border px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}