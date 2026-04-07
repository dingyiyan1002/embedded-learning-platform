import { AIConfig } from '@/types';

const AI_CONFIG_KEY = 'embedded-learning-ai-config';

const defaultConfig: AIConfig = {
  activeProvider: 'DeepSeek',
  providers: [
    {
      name: 'DeepSeek',
      apiKey: '',
      baseUrl: 'https://api.deepseek.com/v1',
      defaultModel: 'deepseek-chat',
      enabled: true,
    },
  ],
  systemPrompt: `你是一位嵌入式C语言教学助手。请根据学生的题目情况给出清晰的讲解和提示。
规则：
1. 先分析学生的错误原因
2. 给出相关的知识点讲解
3. 提供引导性提示，不要直接给出答案
4. 用简洁易懂的语言解释
5. 适当举例说明`,
};

export function loadAIConfig(): AIConfig {
  try {
    const stored = localStorage.getItem(AI_CONFIG_KEY);
    if (stored) {
      return { ...defaultConfig, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to load AI config:', e);
  }
  return { ...defaultConfig };
}

export function saveAIConfig(config: AIConfig): void {
  try {
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save AI config:', e);
  }
}

export async function testAIProvider(provider: { apiKey: string; baseUrl: string; defaultModel: string }): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.defaultModel,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10,
      }),
    });

    if (response.ok) {
      return { success: true, message: '连接成功' };
    }
    const error = await response.json().catch(() => ({}));
    return { success: false, message: `连接失败: ${response.status}` };
  } catch (e: any) {
    return { success: false, message: `网络错误: ${e.message}` };
  }
}

export async function getAIExplanation(config: AIConfig, question: any, userAnswer: string, isCorrect: boolean): Promise<{ explanation: string; hints: string[] }> {
  const provider = config.providers.find(p => p.name === config.activeProvider);
  if (!provider || !provider.apiKey) {
    return { explanation: '请先配置 AI 服务商的 API Key', hints: [] };
  }

  try {
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.defaultModel,
        messages: [
          { role: 'system', content: config.systemPrompt },
          {
            role: 'user',
            content: `题目类型: ${question.type}\n题目代码: ${question.code || ''}\n题目描述: ${question.question || ''}\n正确答案: ${Array.isArray(question.answer) ? question.answer.join(', ') : question.answer}\n学生答案: ${userAnswer}\n是否正确: ${isCorrect ? '是' : '否'}\n\n请给出详细解析和3个渐进式提示。`,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      return {
        explanation: content,
        hints: content.split('\n').filter((l: string) => l.trim()).slice(0, 3),
      };
    }
    return { explanation: 'AI 服务请求失败，请检查配置', hints: [] };
  } catch (e: any) {
    return { explanation: `请求错误: ${e.message}`, hints: [] };
  }
}

export async function getSupportedModels(provider: { apiKey: string; baseUrl: string }): Promise<string[]> {
  try {
    const response = await fetch(`${provider.baseUrl}/models`, {
      headers: { 'Authorization': `Bearer ${provider.apiKey}` },
    });
    if (response.ok) {
      const data = await response.json();
      return (data.data || []).map((m: any) => m.id).sort();
    }
  } catch (e) {
    console.error('Failed to fetch models:', e);
  }
  return [];
}
