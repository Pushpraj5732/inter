import type { AITool } from '@/types';

export const AI_TOOLS: AITool[] = [
  {
    id: 'cursor',
    name: 'Cursor',
    category: 'AI Code Editor',
    icon: 'Code2',
    plans: [
      { name: 'Hobby', monthlyPrice: 0, features: ['Basic AI completions', 'Limited requests'] },
      { name: 'Pro', monthlyPrice: 20, annualPrice: 192, features: ['500 fast requests/mo', 'Unlimited slow requests', 'GPT-4, Claude 3.5'] },
      { name: 'Business', monthlyPrice: 40, annualPrice: 384, seats: 1, features: ['Everything in Pro', 'Team management', 'Advanced analytics'] },
      { name: 'Enterprise', monthlyPrice: 40, annualPrice: 384, features: ['SSO', 'Advanced security', 'Custom contracts'] },
    ],
    bestFor: ['coding'],
    alternatives: ['github-copilot', 'windsurf'],
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    category: 'AI Code Completion',
    icon: 'Github',
    plans: [
      { name: 'Individual', monthlyPrice: 10, annualPrice: 100, features: ['Code completions', 'Chat', 'GitHub integration'] },
      { name: 'Business', monthlyPrice: 19, annualPrice: 228, seats: 1, features: ['Code completions', 'Chat', 'Team management', 'Policy controls'] },
      { name: 'Enterprise', monthlyPrice: 39, annualPrice: 468, seats: 1, features: ['Everything in Business', 'SSO', 'Audit logs', 'IP indemnity'] },
    ],
    bestFor: ['coding'],
    alternatives: ['cursor', 'windsurf'],
  },
  {
    id: 'claude',
    name: 'Claude',
    category: 'AI Assistant',
    icon: 'Bot',
    plans: [
      { name: 'Free', monthlyPrice: 0, features: ['Limited messages', 'Claude 3.5 Sonnet'] },
      { name: 'Pro', monthlyPrice: 20, annualPrice: 216, features: ['5x more usage', 'Claude 3.5 Opus', 'Priority access'] },
      { name: 'Max', monthlyPrice: 100, annualPrice: 1200, features: ['20x more usage than Pro', 'Extended thinking', 'Research features'] },
      { name: 'Team', monthlyPrice: 25, annualPrice: 300, seats: 1, features: ['Shared workspaces', 'Team billing', 'Admin controls'] },
      { name: 'Enterprise', monthlyPrice: 50, annualPrice: 600, seats: 1, features: ['SSO', 'Audit logs', 'Custom retention'] },
    ],
    bestFor: ['writing', 'research', 'coding', 'mixed'],
    alternatives: ['chatgpt', 'gemini'],
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    category: 'AI Assistant',
    icon: 'MessageSquare',
    plans: [
      { name: 'Free', monthlyPrice: 0, features: ['GPT-4o mini', 'Limited messages'] },
      { name: 'Plus', monthlyPrice: 20, annualPrice: 240, features: ['GPT-4o', 'DALL-E', 'Browse', 'Code interpreter'] },
      { name: 'Team', monthlyPrice: 25, annualPrice: 300, seats: 1, features: ['Higher message caps', 'Team workspace', 'Admin console'] },
      { name: 'Enterprise', monthlyPrice: 60, annualPrice: 720, seats: 1, features: ['Unlimited GPT-4o', 'SSO', 'Audit logs', 'Custom models'] },
    ],
    bestFor: ['writing', 'research', 'coding', 'mixed'],
    alternatives: ['claude', 'gemini'],
  },
  {
    id: 'anthropic-api',
    name: 'Anthropic API',
    category: 'API',
    icon: 'Braces',
    plans: [
      { name: 'Pay-as-you-go', monthlyPrice: 0, features: ['Claude 3.5 Sonnet', 'Claude 3.5 Haiku', 'Usage-based pricing'] },
    ],
    bestFor: ['coding', 'data', 'research'],
    alternatives: ['openai-api', 'gemini-api'],
  },
  {
    id: 'openai-api',
    name: 'OpenAI API',
    category: 'API',
    icon: 'Braces',
    plans: [
      { name: 'Pay-as-you-go', monthlyPrice: 0, features: ['GPT-4o', 'GPT-4o mini', 'DALL-E', 'Whisper', 'Usage-based pricing'] },
    ],
    bestFor: ['coding', 'data', 'research'],
    alternatives: ['anthropic-api', 'gemini-api'],
  },
  {
    id: 'gemini',
    name: 'Gemini',
    category: 'AI Assistant',
    icon: 'Sparkles',
    plans: [
      { name: 'Free', monthlyPrice: 0, features: ['Gemini 1.5 Flash', 'Limited queries'] },
      { name: 'Pro', monthlyPrice: 19.99, annualPrice: 239.88, features: ['Gemini 1.5 Pro', '2M token context', 'Advanced reasoning'] },
      { name: 'Ultra', monthlyPrice: 249.99, annualPrice: 2999.88, features: ['Gemini Ultra', 'Deep research', 'Code execution'] },
      { name: 'API', monthlyPrice: 0, features: ['Pay-as-you-go', 'All Gemini models'] },
    ],
    bestFor: ['writing', 'research', 'coding', 'mixed'],
    alternatives: ['chatgpt', 'claude'],
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    category: 'AI Code Editor',
    icon: 'Wind',
    plans: [
      { name: 'Free', monthlyPrice: 0, features: ['Basic AI features', 'Limited completions'] },
      { name: 'Pro', monthlyPrice: 10, annualPrice: 120, features: ['Unlimited completions', 'Advanced AI', 'Multi-file editing'] },
    ],
    bestFor: ['coding'],
    alternatives: ['cursor', 'github-copilot'],
  },
];

export const API_PRICING: Record<string, { inputPer1k: number; outputPer1k: number }> = {
  'anthropic-api': { inputPer1k: 0.003, outputPer1k: 0.015 },
  'openai-api': { inputPer1k: 0.005, outputPer1k: 0.015 },
  'gemini-api': { inputPer1k: 0.00125, outputPer1k: 0.005 },
};

export function getToolById(id: string): AITool | undefined {
  return AI_TOOLS.find(t => t.id === id);
}

export function getPlanPrice(toolId: string, planName: string): number {
  const tool = getToolById(toolId);
  if (!tool) return 0;
  const plan = tool.plans.find(p => p.name === planName);
  return plan?.monthlyPrice || 0;
}

export function getAnnualSavings(toolId: string, planName: string): number {
  const tool = getToolById(toolId);
  if (!tool) return 0;
  const plan = tool.plans.find(p => p.name === planName);
  if (!plan?.annualPrice || !plan?.monthlyPrice) return 0;
  return (plan.monthlyPrice * 12) - plan.annualPrice;
}
