import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Zap,
  TrendingDown,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import type { AuditResult } from '@/types';

interface SharedAudit {
  tools: any[];
  teamSize: number;
  useCase: string;
  result: AuditResult;
  shareId: string;
}

const MOCK_SHARED_AUDIT: SharedAudit = {
  shareId: 'demo123',
  tools: [
    { toolId: 'cursor', planName: 'Business', monthlySpend: 120, seats: 3 },
    { toolId: 'claude', planName: 'Max', monthlySpend: 100, seats: 1 },
    { toolId: 'chatgpt', planName: 'Team', monthlySpend: 75, seats: 3 },
  ],
  teamSize: 3,
  useCase: 'coding',
  result: {
    recommendations: [
      {
        toolId: 'cursor',
        toolName: 'Cursor',
        currentPlan: 'Business',
        currentSpend: 120,
        recommendedAction: 'downgrade_plan',
        recommendedPlan: 'Pro',
        newSpend: 60,
        monthlySavings: 60,
        annualSavings: 720,
        reasoning: 'Cursor Business adds team analytics and admin controls. For a 3-person team, Cursor Pro has the same AI power without the management overhead.',
        confidence: 'high',
      },
      {
        toolId: 'claude',
        toolName: 'Claude',
        currentPlan: 'Max',
        currentSpend: 100,
        recommendedAction: 'downgrade_plan',
        recommendedPlan: 'Pro',
        newSpend: 20,
        monthlySavings: 80,
        annualSavings: 960,
        reasoning: 'Claude Max is designed for power users with 20x higher usage limits. At $100/month for a single user, you are likely not maxing out Claude Pros 5x limits.',
        confidence: 'medium',
      },
      {
        toolId: 'chatgpt',
        toolName: 'ChatGPT',
        currentPlan: 'Team',
        currentSpend: 75,
        recommendedAction: 'downgrade_plan',
        recommendedPlan: 'Plus',
        newSpend: 60,
        monthlySavings: 15,
        annualSavings: 180,
        reasoning: 'ChatGPT Team adds workspace features. For a 3-person dev team, Plus provides the same core model access at a lower per-seat cost.',
        confidence: 'high',
      },
    ],
    totalMonthlySavings: 155,
    totalAnnualSavings: 1860,
    totalCurrentSpend: 295,
    summary: 'Found $155/month in savings across 3 tools by right-sizing plans to actual usage.',
    alreadyOptimized: false,
  },
};

export default function SharePage() {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [audit, setAudit] = useState<SharedAudit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        // In mock mode, use demo data or look up from memory
        const { getAudit } = await import('@/lib/supabase');
        const { data } = await getAudit(shareId || '');
        if (data && data.result) {
          setAudit(data as SharedAudit);
        } else if (shareId === 'demo123') {
          setAudit(MOCK_SHARED_AUDIT);
        } else {
          // Generate a plausible demo for any share ID
          setAudit(MOCK_SHARED_AUDIT);
        }
      } catch {
        setError('Could not load this audit. It may have expired or been removed.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-14 border-b" />
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Audit not found</h1>
          <p className="text-muted-foreground mb-6">{error || 'This audit link may have expired or been removed.'}</p>
          <Button onClick={() => navigate('/')}>
            Get Your Own Free Audit
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  const result = audit.result;

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header */}
      <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            <span className="font-bold text-sm">AI Spend Audit</span>
          </div>
          <Button size="sm" onClick={() => navigate('/audit')}>
            Audit My Tools
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Shared audit hero */}
        <Card className="mb-6 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
          <CardContent className="pt-6 pb-6 text-center">
            <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4">
              <TrendingDown className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold mb-1">
              ${Math.round(result.totalMonthlySavings).toLocaleString()}/mo in potential savings
            </h1>
            <p className="text-3xl font-extrabold text-orange-600 mb-2">
              ${Math.round(result.totalAnnualSavings).toLocaleString()}/year
            </p>
            <p className="text-muted-foreground">
              Across {audit.tools.length} AI tools for a {audit.teamSize}-person {audit.useCase} team
            </p>
          </CardContent>
        </Card>

        {/* Recommendations (anonymized) */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3">Optimizations found</h2>
          <div className="space-y-3">
            {result.recommendations.map((rec, i) => (
              <Card key={i} className="border-border/60">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        rec.confidence === 'high' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {rec.confidence === 'high' ? <CheckCircle2 className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{rec.toolName}</div>
                        <div className="text-xs text-muted-foreground">
                          {rec.currentPlan} → {rec.alternativeTool || rec.recommendedPlan || 'Annual'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-green-600">-${Math.round(rec.monthlySavings)}/mo</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{rec.reasoning}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card className="border-orange-200 bg-orange-50 mb-6">
          <CardContent className="pt-5 pb-5 text-center">
            <h3 className="font-bold mb-2">Get your own free audit</h3>
            <p className="text-sm text-muted-foreground mb-4">
              See how much your team could save. Takes 60 seconds, no signup required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate('/audit')}>
                <Zap className="mr-2 h-4 w-4" />
                Start My Audit
              </Button>
              <Button variant="outline" onClick={() => window.open('https://credex.rocks', '_blank')}>
                Learn About Credex
                <ExternalLink className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pb-8">
          <p>Shared via AI Spend Audit by Credex</p>
        </div>
      </div>
    </div>
  );
}
