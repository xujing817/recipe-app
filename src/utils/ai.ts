export interface AIRecipeResult {
  name: string;
  category: string;
  ingredients: string[];
  steps: string[];
  prep_time: number;
  cook_time: number;
}

export const generateRecipeFromText = async (text: string): Promise<AIRecipeResult | null> => {
  try {
    const response = await fetch('/api/ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen3.5-flash',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的菜谱分析助手。请从用户提供的文本中提取菜谱信息。要求：1. 忽略乱码、广告、无关内容和HTML标签；2. 精准识别菜名、食材清单和烹饪步骤；3. 如果文本中有多个菜谱，只提取第一个；4. 如果无法识别出菜谱信息，返回空的JSON对象。请严格按照以下JSON格式输出，不要包含任何额外的文字：{"name": "菜谱名称", "category": "分类（从家常菜、川菜、粤菜、湘菜、甜品、汤羹、主食、其他中选择）", "ingredients": ["食材1", "食材2", ...], "steps": ["步骤1", "步骤2", ...], "prep_time": 准备时间(分钟), "cook_time": 烹饪时间(分钟)}',
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
      console.error('AI API response error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    try {
      const result = JSON.parse(content) as AIRecipeResult;
      return result;
    } catch {
      return null;
    }
  } catch (error) {
    console.error('AI API call failed:', error);
    return null;
  }
};