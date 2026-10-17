import type { UserTool, AuditResult, AuditRecommendation, AuditInput } from '@/types';
import { AI_TOOLS, getToolById } from './pricingData';

export function runAudit(input: AuditInput): AuditResult {
  const recommendations: AuditRecommendation[] = [];

  for (const userTool of input.tools) {
    const tool = getToolById(userTool.toolId);
    if (!tool) continue;

    const rec = evaluateTool(userTool, tool, input.teamSize, input.useCase);
    if (rec) {
      recommendations.push(rec);
    }
  }

  // Sort by savings (highest first)
  recommendations.sort((a, b) => b.monthlySavings - a.monthlySavings);

  const totalMonthlySavings = recommendations.reduce((sum, r) => sum + r.monthlySavings, 0);
  const totalAnnualSavings = recommendations.reduce((sum, r) => sum + r.annualSavings, 0);
  const totalCurrentSpend = input.tools.reduce((sum, t) => sum + t.monthlySpend, 0);
  const alreadyOptimized = totalMonthlySavings < 100;

  const summary = generateSummary(recommendations, totalMonthlySavings, totalCurrentSpend, alreadyOptimized);

  return {
    recommendations,
    totalMonthlySavings,
    totalAnnualSavings,
    totalCurrentSpend,
    summary,
    alreadyOptimized,
  };
}

function evaluateTool(
  userTool: UserTool,
  tool: typeof AI_TOOLS[0],
  teamSize: number,
  useCase: string
): AuditRecommendation | null {
  const currentPlan = tool.plans.find(p => p.name === userTool.planName);
  if (!currentPlan) return null;

  const currentSpend = userTool.monthlySpend;
  const perSeatSpend = userTool.seats > 0 ? currentSpend / userTool.seats : currentSpend;

  let bestAction: { type: string; plan?: string; altTool?: string; newSpend: number; reasoning: string; confidence: 'high' | 'medium' | 'low' } | null = null;

  // Check 1: Is the plan right-sized for the team?
  const planCheck = checkPlanFit(tool, userTool, currentPlan, teamSize, useCase, perSeatSpend);
  if (planCheck) {
    bestAction = planCheck;
  }

  // Check 2: Is there a cheaper alternative tool?
  const altCheck = checkAlternativeTool(tool, userTool, useCase, currentSpend, perSeatSpend);
  if (altCheck && (!bestAction || altCheck.newSpend < bestAction.newSpend)) {
    bestAction = altCheck;
  }

  // Check 3: Annual billing discount
  const annualCheck = checkAnnualDiscount(tool, userTool, currentSpend, bestAction?.newSpend);
  if (annualCheck && (!bestAction || annualCheck.savings > (currentSpend - bestAction.newSpend))) {
    bestAction = {
      type: 'switch_to_annual',
      plan: userTool.planName,
      newSpend: currentSpend - annualCheck.savings,
      reasoning: annualCheck.reasoning,
      confidence: 'high',
    };
  }

  if (!bestAction || bestAction.newSpend >= currentSpend) return null;

  const monthlySavings = currentSpend - bestAction.newSpend;
  const annualSavings = monthlySavings * 12;

  return {
    toolId: tool.id,
    toolName: tool.name,
    currentPlan: userTool.planName,
    currentSpend,
    recommendedAction: bestAction.type,
    recommendedPlan: bestAction.plan,
    alternativeTool: bestAction.altTool,
    newSpend: bestAction.newSpend,
    monthlySavings,
    annualSavings,
    reasoning: bestAction.reasoning,
    confidence: bestAction.confidence,
  };
}

function checkPlanFit(
  tool: typeof AI_TOOLS[0],
  userTool: UserTool,
  currentPlan: typeof tool.plans[0],
  teamSize: number,
  _useCase: string,
  _perSeatSpend: number
) {
  // Small team on enterprise plan
  if (teamSize <= 2 && ['Enterprise', 'Max', 'Ultra'].includes(userTool.planName)) {
    const betterPlan = tool.plans.find(p =>
      !['Enterprise', 'Max', 'Ultra'].includes(p.name) && p.monthlyPrice > 0
    );
    if (betterPlan) {
      const newSpend = betterPlan.monthlyPrice * userTool.seats;
      return {
        type: 'downgrade_plan',
        plan: betterPlan.name,
        newSpend: Math.min(newSpend, userTool.monthlySpend),
        reasoning: `${tool.name} ${userTool.planName} is overkill for a ${teamSize}-person team. ${betterPlan.name} has the features you actually need at a fraction of the cost.`,
        confidence: 'high' as const,
      };
    }
  }

  // Solo user on team plan
  if (userTool.seats === 1 && ['Team', 'Business'].includes(userTool.planName)) {
    const individualPlan = tool.plans.find(p =>
      ['Individual', 'Pro', 'Plus'].includes(p.name)
    );
    if (individualPlan) {
      const newSpend = individualPlan.monthlyPrice * userTool.seats;
      return {
        type: 'downgrade_plan',
        plan: individualPlan.name,
        newSpend: Math.min(newSpend, userTool.monthlySpend),
        reasoning: `As a solo user, you don't need ${tool.name} ${userTool.planName}'s team features. ${individualPlan.name} gives you the same core capabilities for much less.`,
        confidence: 'high' as const,
      };
    }
  }

  // Free tier sufficient
  const freePlan = tool.plans.find(p => p.name === 'Free');
  if (freePlan && currentPlan.monthlyPrice > 0 && userTool.monthlySpend < 30) {
    return {
      type: 'downgrade_to_free',
      plan: 'Free',
      newSpend: 0,
      reasoning: `At $${userTool.monthlySpend}/month, you're barely using ${tool.name}. The free tier likely covers your light usage — try it before paying.`,
      confidence: 'medium' as const,
    };
  }

  return null;
}

function checkAlternativeTool(
  tool: typeof AI_TOOLS[0],
  userTool: UserTool,
  useCase: string,
  currentSpend: number,
  _perSeatSpend: number
) {
  const useCaseMatch = (toolToCheck: typeof tool) => {
    return toolToCheck.bestFor.includes(useCase) || useCase === 'mixed';
  };

  for (const altId of tool.alternatives) {
    const altTool = getToolById(altId);
    if (!altTool || !useCaseMatch(altTool)) continue;

    const cheapestPaid = altTool.plans
      .filter(p => p.monthlyPrice > 0)
      .sort((a, b) => a.monthlyPrice - b.monthlyPrice)[0];

    if (!cheapestPaid) continue;

    const altSpend = cheapestPaid.monthlyPrice * userTool.seats;
    const savings = currentSpend - altSpend;

    // Only suggest if savings are meaningful (>20% or >$50/mo)
    if (savings > 50 && (savings / currentSpend) > 0.2) {
      return {
        type: 'switch_tool',
        altTool: altTool.name,
        newSpend: altSpend,
        reasoning: `${altTool.name} ($${cheapestPaid.monthlyPrice}/mo) offers similar ${useCase} capabilities to ${tool.name} ${userTool.planName} ($${currentSpend}/mo). Based on your use case, you're paying a premium for features you don't need.`,
        confidence: 'medium' as const,
      };
    }
  }

  // Specific: Cursor Business -> Cursor Pro for small teams
  if (tool.id === 'cursor' && userTool.planName === 'Business' && userTool.seats <= 3) {
    const proPlan = tool.plans.find(p => p.name === 'Pro');
    if (proPlan) {
      return {
        type: 'downgrade_plan',
        plan: 'Pro',
        newSpend: proPlan.monthlyPrice * userTool.seats,
        reasoning: `Cursor Business adds team analytics and admin controls. For a ${userTool.seats}-person team, Cursor Pro has the same AI power without the management overhead you're not using yet.`,
        confidence: 'high' as const,
      };
    }
  }

  // Specific: Claude Max -> Claude Pro for most users
  if (tool.id === 'claude' && userTool.planName === 'Max') {
    const proPlan = tool.plans.find(p => p.name === 'Pro');
    if (proPlan && currentSpend > proPlan.monthlyPrice * userTool.seats * 2) {
      return {
        type: 'downgrade_plan',
        plan: 'Pro',
        newSpend: proPlan.monthlyPrice * userTool.seats,
        reasoning: `Claude Max is designed for power users with 20x higher usage limits. At $${currentSpend}/month, you're likely not maxing out Claude Pro's 5x limits. Downgrade and monitor — you can always upgrade back.`,
        confidence: 'medium' as const,
      };
    }
  }

  return null;
}

function checkAnnualDiscount(
  tool: typeof AI_TOOLS[0],
  userTool: UserTool,
  _currentSpend: number,
  alreadySavingsSpend?: number
) {
  const currentPlan = tool.plans.find(p => p.name === userTool.planName);
  if (!currentPlan?.annualPrice) return null;

  const monthlyAnnualEquiv = currentPlan.annualPrice / 12;
  const annualSavingsPerSeat = currentPlan.monthlyPrice - monthlyAnnualEquiv;

  if (annualSavingsPerSeat <= 0) return null;

  const totalAnnualSavings = annualSavingsPerSeat * userTool.seats;
  const newMonthly = monthlyAnnualEquiv * userTool.seats;

  // Only worth it if we haven't already found bigger savings
  if (alreadySavingsSpend !== undefined && newMonthly >= alreadySavingsSpend) return null;

  return {
    savings: totalAnnualSavings,
    reasoning: `Switching to annual billing saves you ~$${Math.round(totalAnnualSavings)}/month ($${Math.round(totalAnnualSavings * 12)}/year) with the same ${userTool.planName} features. Most vendors offer 15-20% off for annual commitment.`,
  };
}

function generateSummary(
  recs: AuditRecommendation[],
  totalSavings: number,
  totalSpend: number,
  alreadyOptimized: boolean
): string {
  if (alreadyOptimized || recs.length === 0) {
    return `Your AI tool stack is well-optimized. You're spending efficiently across ${recs.length > 0 ? 'your selected tools' : 'the board'}. We\'ll notify you when new savings opportunities arise.`;
  }

  const topRec = recs[0];
  const savingsPercent = ((totalSavings / totalSpend) * 100).toFixed(0);

  return `We found $${Math.round(totalSavings)}/month in potential savings (${savingsPercent}% of your total spend). ${topRec.toolName} offers the biggest opportunity — ${topRec.reasoning}`;
}

// Template-based AI summary fallback
export function generateFallbackSummary(result: AuditResult, teamSize: number, useCase: string): string {
  const { recommendations, totalMonthlySavings, totalCurrentSpend } = result;
  const savingsPercent = ((totalMonthlySavings / totalCurrentSpend) * 100).toFixed(0);

  if (recommendations.length === 0) {
    return `Great news — your AI tool spending is already well-optimized for a ${teamSize}-person team focused on ${useCase}. Your current stack balances capability and cost effectively. As your team grows or new tools launch, we'll keep monitoring for savings opportunities that match your workflow.`;
  }

  const parts: string[] = [];
  parts.push(`For your ${teamSize}-person team using AI primarily for ${useCase}, I found $${Math.round(totalMonthlySavings)}/month in savings — that's ${savingsPercent}% of your total AI spend and $${Math.round(totalMonthlySavings * 12)}/year back in your budget.`);

  const top3 = recommendations.slice(0, 3);
  top3.forEach((rec, i) => {
    const action = rec.recommendedAction === 'switch_tool'
      ? `switching from ${rec.toolName} to ${rec.alternativeTool}`
      : `adjusting your ${rec.toolName} plan`;
    parts.push(`${i + 1}. ${action} could save $${Math.round(rec.monthlySavings)}/month — ${rec.reasoning}`);
  });

  if (totalMonthlySavings > 500) {
    parts.push(`With over $${Math.round(totalMonthlySavings)}/month in identified savings, there's significant value to capture. Many of these optimizations can be implemented today with zero workflow disruption.`);
  }

  return parts.join(' ');
}
