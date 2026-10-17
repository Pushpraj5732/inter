import type { AuditResult } from '@/types';
import { generateFallbackSummary } from './auditEngine';

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || '';
const API_URL = 'https://api.anthropic.com/v1/messages';

export async function generateAISummary(
  result: AuditResult,
  teamSize: number,
  useCase: string
): Promise<string> {
  // If no API key, use fallback immediately
  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'demo') {
    return generateFallbackSummary(result, teamSize, useCase);
  }

  try {
    const prompt = buildPrompt(result, teamSize, useCase);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    // Handle rate limiting with retry
    if (response.status === 429) {
      await new Promise(r => setTimeout(r, 500));
      const retry = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 300,
          temperature: 0.7,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!retry.ok) {
        return generateFallbackSummary(result, teamSize, useCase);
      }

      const retryData = await retry.json();
      return retryData.content?.[0]?.text || generateFallbackSummary(result, teamSize, useCase);
    }

    if (!response.ok) {
      console.warn(`AI API error: ${response.status}`);
      return generateFallbackSummary(result, teamSize, useCase);
    }

    const data = await response.json();
    return data.content?.[0]?.text || generateFallbackSummary(result, teamSize, useCase);
  } catch (error) {
    console.warn('AI summary failed:', error);
    return generateFallbackSummary(result, teamSize, useCase);
  }
}

function buildPrompt(result: AuditResult, teamSize: number, useCase: string): string {
  const { recommendations, totalMonthlySavings, totalCurrentSpend } = result;
  const savingsPercent = ((totalMonthlySavings / totalCurrentSpend) * 100).toFixed(0);

  let recText = '';
  recommendations.slice(0, 4).forEach((rec, i) => {
    const action = rec.recommendedAction === 'switch_tool'
      ? `switch from ${rec.toolName} to ${rec.alternativeTool}`
      : rec.recommendedAction === 'downgrade_to_free'
      ? `downgrade ${rec.toolName} to the free tier`
      : `adjust ${rec.toolName} from ${rec.currentPlan} to ${rec.recommendedPlan || 'annual billing'}`;
    recText += `${i + 1}. ${action}: saves $${Math.round(rec.monthlySavings)}/month — ${rec.reasoning}\n`;
  });

  return `Write a ~100 word personalized AI tool spend audit summary for a ${teamSize}-person startup team that uses AI primarily for ${useCase}.

FINANCIAL SUMMARY:
- Total monthly AI spend: $${Math.round(totalCurrentSpend)}
- Potential monthly savings: $${Math.round(totalMonthlySavings)} (${savingsPercent}%)
- Potential annual savings: $${Math.round(totalMonthlySavings * 12)}

TOP RECOMMENDATIONS:
${recText}

Write in the voice of a friendly, knowledgeable financial advisor. Be honest — don't oversell savings. Use natural, professional language. Include specific dollar amounts. If savings are under $100, acknowledge they're spending well. End with an encouraging but realistic note. Keep it to exactly one paragraph around 100 words.`;
}
