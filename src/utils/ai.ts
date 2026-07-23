export interface AIRecipeResult {
  name: string;
  category: string;
  ingredients: string[];
  steps: string[];
  prep_time: number;
  cook_time: number;
}

const AI_TIMEOUT_MS = 60000; // 60 seconds timeout

export const generateRecipeFromText = async (text: string, token?: string | null): Promise<AIRecipeResult | null> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch('/api/ai/chat/completions', {
      method: 'POST',
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        model: 'qwen3.5-flash',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的菜谱分析助手。请从用户提供的文本中提取菜谱信息。要求：1. 忽略乱码、广告、无关内容和HTML标签；2. 精准识别菜名、食材清单和烹饪步骤；3. 如果文本中有多个菜谱，只提取第一个；4. 如果无法识别出菜谱信息，返回空的JSON对象。请严格按照以下JSON格式输出：{"name": "菜谱名称"}',
          },
          {
            role: 'user',
            content: `请分析以下菜谱描述并整理成结构化数据：${text}`,
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      console.error('AI API response error:', response.status);
      return null;
    }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    try {
      return JSON.parse(content) as AIRecipeResult;
    } catch {
      return null;
    }
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.error('AI API request timed out after', AI_TIMEOUT_MS / 1000, 'seconds');
      return null;
    }
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('AI API request failed: network error or timeout');
      return null;
    }
    console.error('AI API call failed:', error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};
