export interface ToolPlan {
  name: string;
  monthlyPrice: number;
  annualPrice?: number;
  seats?: number;
  features: string[];
}

export interface AITool {
  id: string;
  name: string;
  category: string;
  icon: string;
  plans: ToolPlan[];
  bestFor: string[];
  alternatives: string[];
}

export interface UserTool {
  toolId: string;
  planName: string;
  monthlySpend: number;
  seats: number;
}

export interface AuditRecommendation {
  toolId: string;
  toolName: string;
  currentPlan: string;
  currentSpend: number;
  recommendedAction: string;
  recommendedPlan?: string;
  alternativeTool?: string;
  newSpend: number;
  monthlySavings: number;
  annualSavings: number;
  reasoning: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface AuditResult {
  recommendations: AuditRecommendation[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  totalCurrentSpend: number;
  summary: string;
  aiSummary?: string;
  alreadyOptimized: boolean;
}

export interface AuditInput {
  tools: UserTool[];
  teamSize: number;
  useCase: string;
  companyName?: string;
  email?: string;
}

export interface LeadData {
  id?: string;
  email: string;
  company_name?: string;
  role?: string;
  team_size?: number;
  total_monthly_spend: number;
  total_monthly_savings: number;
  tools_audited: string[];
  created_at?: string;
}

export type UseCase = 'coding' | 'writing' | 'data' | 'research' | 'mixed';
