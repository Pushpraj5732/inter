import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

// Mock mode for demo when no real Supabase credentials
const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://demo.supabase.co';

const mockAudits = new Map();

export async function saveAudit(audit) {
  if (isMock) {
    mockAudits.set(audit.shareId, audit);
    return { data: { id: audit.shareId }, error: null };
  }

  return supabase.from('audits').insert({
    share_id: audit.shareId,
    tools: audit.tools,
    team_size: audit.teamSize,
    use_case: audit.useCase,
    total_spend: audit.result.totalCurrentSpend,
    total_savings: audit.result.totalMonthlySavings,
    recommendations: audit.result.recommendations,
    created_at: new Date().toISOString(),
  }).select('id');
}

export async function getAudit(shareId) {
  if (isMock) {
    const audit = mockAudits.get(shareId);
    return audit ? { data: audit, error: null } : { data: null, error: { message: 'Not found' } };
  }

  return supabase
    .from('audits')
    .select('*')
    .eq('share_id', shareId)
    .single();
}

export async function saveLead(lead) {
  if (isMock) {
    console.log('Mock lead saved:', lead);
    return { data: { id: 'mock-' + Date.now() }, error: null };
  }

  return supabase.from('leads').insert({
    email: lead.email,
    company_name: lead.companyName,
    role: lead.role,
    team_size: lead.teamSize,
    total_monthly_spend: lead.totalMonthlySpend,
    total_monthly_savings: lead.totalMonthlySavings,
    tools_audited: lead.toolsAudited,
    created_at: new Date().toISOString(),
  }).select('id');
}
