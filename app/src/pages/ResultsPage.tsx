import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Zap,
  ArrowLeft,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Share2,
  Check,
  Mail,
  Building2,
  Users,
  Sparkles,
  Shield,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { runAudit, generateFallbackSummary } from '@/lib/auditEngine';
import { generateAISummary } from '@/lib/aiSummary';
import { saveAudit, saveLead } from '@/lib/supabase';
import { checkRateLimit, isHoneypotTriggered } from '@/lib/rateLimit';
import { toast } from 'sonner';
import type { AuditResult, AuditInput } from '@/types';

export default function ResultsPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState<AuditResult | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  // Lead form state
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [expandedRecs, setExpandedRecs] = useState<Set<number>>(new Set([0]));

  const [auditInput, setAuditInput] = useState<AuditInput | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('audit-input');
    if (!raw) {
      navigate('/audit');
      return;
    }

    const input: AuditInput = JSON.parse(raw);
    setAuditInput(input);

    // Run audit
    const auditResult = runAudit(input);
    setResult(auditResult);

    // Generate AI summary
    const generate = async () => {
      try {
        const summary = await generateAISummary(auditResult, input.teamSize, input.useCase);
        setAiSummary(summary);
      } catch {
        const fallback = generateFallbackSummary(auditResult, input.teamSize, input.useCase);
        setAiSummary(fallback);
      } finally {
        setLoading(false);
      }
    };

    generate();
  }, [navigate]);

  // Save audit for sharing
  useEffect(() => {
    if (!result || !auditInput) return;
    const save = async () => {
      const shareId = generateShareId();
      await saveAudit({
        tools: auditInput.tools,
        teamSize: auditInput.teamSize,
        useCase: auditInput.useCase,
        result,
        shareId,
      });
      const url = `${window.location.origin}${window.location.pathname}#/share/${shareId}`;
      setShareUrl(url);
    };
    save();
  }, [result, auditInput]);

  const handleShare = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Could not copy link');
    }
  }, [shareUrl]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result || !auditInput) return;

    // Rate limit check
    const limit = checkRateLimit();
    if (!limit.allowed) {
      const mins = Math.ceil(limit.resetIn / 60000);
      toast.error(`Rate limited. Try again in ${mins} minute${mins > 1 ? 's' : ''}.`);
      return;
    }

    // Honeypot check
    if (isHoneypotTriggered(honeypot)) {
      toast.success('Saved successfully!');
      setLeadSubmitted(true);
      return;
    }

    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }

    try {
      await saveLead({
        email,
        companyName: companyName || undefined,
        role: role || undefined,
        teamSize: auditInput.teamSize,
        totalMonthlySpend: result.totalCurrentSpend,
        totalMonthlySavings: result.totalMonthlySavings,
        toolsAudited: auditInput.tools.map(t => t.toolId),
      });
      setLeadSubmitted(true);
      toast.success('Audit saved! Check your email for confirmation.');
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  const toggleRec = (i: number) => {
    setExpandedRecs(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  if (loading || !result) {
    return <ResultsSkeleton />;
  }

  const isHighSavings = result.totalMonthlySavings > 500;
  const isOptimized = result.alreadyOptimized || result.totalMonthlySavings < 100;
  const savingsPercent = result.totalCurrentSpend > 0
    ? Math.round((result.totalMonthlySavings / result.totalCurrentSpend) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/audit')}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Edit
          </Button>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-orange-500" />
            <span className="font-semibold text-sm">Your Audit Results</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleShare} disabled={!shareUrl}>
            {copied ? <Check className="mr-1 h-3.5 w-3.5" /> : <Share2 className="mr-1 h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Share'}
          </Button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <Card className={`mb-6 ${isHighSavings ? 'border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50' : isOptimized ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50' : 'border-border'}`}>
          <CardContent className="pt-6 pb-6 text-center">
            {isOptimized ? (
              <>
                <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h1 className="text-2xl font-bold mb-2">You're spending well</h1>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  Your AI tool stack is well-optimized for your team. We'll keep monitoring and notify you when new savings opportunities arise.
                </p>
                <Badge variant="outline" className="text-sm">Monthly spend: ${result.totalCurrentSpend.toLocaleString()}</Badge>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4">
                  <TrendingDown className="h-7 w-7" />
                </div>
                <h1 className="text-2xl font-bold mb-1">
                  Save ${Math.round(result.totalMonthlySavings).toLocaleString()}/month
                </h1>
                <p className="text-3xl font-extrabold text-orange-600 mb-2">
                  ${Math.round(result.totalAnnualSavings).toLocaleString()}/year
                </p>
                <p className="text-muted-foreground mb-4">
                  {savingsPercent}% reduction from ${result.totalCurrentSpend.toLocaleString()}/month
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary" className="text-sm">{result.recommendations.length} optimization{result.recommendations.length !== 1 ? 's' : ''}</Badge>
                  {isHighSavings && (
                    <Badge className="bg-orange-500 text-white text-sm">High savings opportunity</Badge>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* AI Summary */}
        {aiSummary && (
          <Card className="mb-6 border-blue-200 bg-blue-50/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-semibold text-blue-700">AI-Powered Summary</span>
              </div>
              <p className="text-sm text-blue-900 leading-relaxed">{aiSummary}</p>
            </CardContent>
          </Card>
        )}

        {/* Credex CTA for high savings */}
        {isHighSavings && (
          <Card className="mb-6 border-orange-300 bg-orange-50">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0">
                  <Zap className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-1">Want to capture even more savings?</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Credex sells discounted AI infrastructure credits at 20-40% off retail. With ${Math.round(result.totalMonthlySavings).toLocaleString()}/month in identified savings, we can likely save you an additional 20-30% on top of these optimizations.
                  </p>
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600" onClick={() => setShowLeadForm(true)}>
                    Book a Free Credex Consultation
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3">Per-tool breakdown</h2>
          <div className="space-y-3">
            {result.recommendations.map((rec, i) => (
              <Card key={i} className="border-border/60 overflow-hidden">
                <button
                  onClick={() => toggleRec(i)}
                  className="w-full text-left"
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          rec.confidence === 'high' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {rec.confidence === 'high' ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{rec.toolName}</div>
                          <div className="text-xs text-muted-foreground">
                            {rec.currentPlan} → {rec.alternativeTool || rec.recommendedPlan || 'Annual'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-bold text-sm text-green-600">-${Math.round(rec.monthlySavings)}/mo</div>
                          <div className="text-xs text-muted-foreground">${Math.round(rec.annualSavings)}/yr</div>
                        </div>
                        {expandedRecs.has(i) ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </div>
                  </CardContent>
                </button>
                {expandedRecs.has(i) && (
                  <div className="px-6 pb-4">
                    <Separator className="mb-3" />
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Current: </span>
                        <span className="font-medium">{rec.toolName} {rec.currentPlan} — ${rec.currentSpend.toLocaleString()}/mo</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Recommended: </span>
                        <span className="font-medium">
                          {rec.alternativeTool || `${rec.toolName} ${rec.recommendedPlan || 'Annual'}`} — ${Math.round(rec.newSpend).toLocaleString()}/mo
                        </span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-muted-foreground">Why: </span>
                        <span>{rec.reasoning}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <Badge variant="outline" className="text-xs">
                          Confidence: {rec.confidence}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Save / Lead Capture */}
        <Card className="mb-6">
          <CardContent className="pt-5 pb-5">
            {!showLeadForm && !leadSubmitted ? (
              <div className="text-center">
                <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Save your audit</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                  {isOptimized
                    ? 'Get notified when new AI tool savings opportunities match your stack.'
                    : 'Get your audit results emailed to you and be the first to know about new savings opportunities.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={() => setShowLeadForm(true)} variant="outline">
                    <Mail className="mr-2 h-4 w-4" />
                    Email Me My Results
                  </Button>
                  {shareUrl && (
                    <Button variant="outline" onClick={handleShare}>
                      {copied ? <Check className="mr-2 h-4 w-4" /> : <Share2 className="mr-2 h-4 w-4" />}
                      {copied ? 'Copied!' : 'Copy Share Link'}
                    </Button>
                  )}
                </div>
              </div>
            ) : leadSubmitted ? (
              <div className="text-center">
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-1">You're all set!</h3>
                <p className="text-sm text-muted-foreground">
                  We've saved your audit and sent a confirmation email. We'll reach out if we find more savings.
                </p>
                {shareUrl && (
                  <Button variant="outline" className="mt-4" onClick={handleShare}>
                    {copied ? <Check className="mr-2 h-4 w-4" /> : <Share2 className="mr-2 h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy Share Link'}
                  </Button>
                )}
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit}>
                <h3 className="font-semibold mb-4">Save your audit results</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="flex items-center gap-1 mb-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      Email *
                    </Label>
                    <Input
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="flex items-center gap-1 mb-1.5">
                        <Building2 className="h-3.5 w-3.5" />
                        Company
                      </Label>
                      <Input
                        placeholder="Acme Inc"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="flex items-center gap-1 mb-1.5">
                        <Users className="h-3.5 w-3.5" />
                        Role
                      </Label>
                      <Input
                        placeholder="Engineering Manager"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      />
                    </div>
                  </div>
                  {/* Honeypot field - hidden from users */}
                  <div className="hidden" aria-hidden="true">
                    <Input
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                    <Shield className="h-3.5 w-3.5" />
                    Your data is stored securely. We never share your email.
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="submit" className="flex-1">
                      Save My Audit
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowLeadForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Start Over */}
        <div className="text-center pb-8">
          <Button variant="ghost" onClick={() => {
            sessionStorage.removeItem('audit-input');
            navigate('/audit');
          }}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Start a New Audit
          </Button>
        </div>
      </div>
    </div>
  );
}

function generateShareId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function ResultsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-14 border-b" />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}
