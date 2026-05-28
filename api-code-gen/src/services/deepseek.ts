// DeepSeek API 服务
import { SYSTEM_PROMPT } from '../config/prompt';

const API_URL = 'https://api.deepseek.com/chat/completions';
const MODEL = 'deepseek-chat';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface StreamCallback {
  (chunk: string): void;
}

export interface ApiOptions {
  apiKey: string;
  stream?: boolean;
  onStream?: StreamCallback;
  onComplete?: (fullContent: string) => void;
  onError?: (error: Error) => void;
}

/**
 * 调用 DeepSeek API
 */
export async function callDeepSeek(
  userMessage: string,
  options: ApiOptions
): Promise<string> {
  const { apiKey, stream = false, onStream, onComplete, onError } = options;

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userMessage }
  ];

  try {
    if (stream && onStream) {
      return await streamChat(messages, apiKey, onStream, onComplete);
    } else {
      return await normalChat(messages, apiKey);
    }
  } catch (error) {
    onError?.(error as Error);
    throw error;
  }
}

async function normalChat(messages: ChatMessage[], apiKey: string): Promise<string> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      stream: false
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API 请求失败: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function streamChat(
  messages: ChatMessage[],
  apiKey: string,
  onStream: StreamCallback,
  onComplete?: (content: string) => void
): Promise<string> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      stream: true
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API 请求失败: ${response.status} - ${error}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('无法获取响应流');
  }

  const decoder = new TextDecoder();
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter(line => line.trim());

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content || '';
          if (content) {
            fullContent += content;
            onStream(content);
          }
        } catch {
          // 忽略解析错误
        }
      }
    }
  }

  onComplete?.(fullContent);
  return fullContent;
}
