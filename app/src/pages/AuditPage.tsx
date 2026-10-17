import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Zap,
  Code2,
  Github,
  Bot,
  MessageSquare,
  Braces,
  Sparkles,
  Wind,
  Users,
  Briefcase,
} from 'lucide-react';
import { AI_TOOLS } from '@/lib/pricingData';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { UserTool, UseCase } from '@/types';

const TOOL_ICONS: Record<string, React.ElementType> = {
  cursor: Code2,
  'github-copilot': Github,
  claude: Bot,
  chatgpt: MessageSquare,
  'anthropic-api': Braces,
  'openai-api': Braces,
  gemini: Sparkles,
  windsurf: Wind,
};

const USE_CASES: { value: UseCase; label: string; desc: string }[] = [
  { value: 'coding', label: 'Software Development', desc: 'Writing, reviewing, and shipping code' },
  { value: 'writing', label: 'Content & Writing', desc: 'Marketing copy, docs, emails' },
  { value: 'data', label: 'Data Analysis', desc: 'Analytics, SQL, visualization' },
  { value: 'research', label: 'Research', desc: 'Deep research, summarization' },
  { value: 'mixed', label: 'Mixed Use', desc: 'Combination of the above' },
];

interface FormData {
  tools: UserTool[];
  teamSize: number;
  useCase: UseCase;
}

const STORAGE_KEY = 'ai-spend-audit-form';

export default function AuditPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useLocalStorage<FormData>(STORAGE_KEY, {
    tools: [],
    teamSize: 5,
    useCase: 'coding',
  });
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const addTool = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      tools: [...prev.tools, { toolId: '', planName: '', monthlySpend: 0, seats: 1 }],
    }));
  }, [setFormData]);

  const removeTool = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.filter((_, i) => i !== index),
    }));
  }, [setFormData]);

  const updateTool = useCallback((index: number, field: keyof UserTool, value: any) => {
    setFormData(prev => {
      const tools = [...prev.tools];
      tools[index] = { ...tools[index], [field]: value };
      // Auto-reset plan when tool changes
      if (field === 'toolId') {
        const tool = AI_TOOLS.find(t => t.id === value);
        if (tool) {
          const firstPaid = tool.plans.find(p => p.monthlyPrice > 0);
          tools[index] = { ...tools[index], planName: firstPaid?.name || tool.plans[0]?.name || '' };
        }
      }
      return { ...prev, tools };
    });
    // Clear error for this field
    setErrors(prev => {
      const next = { ...prev };
      delete next[`tool-${index}-${field}`];
      return next;
    });
  }, [setFormData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (formData.tools.length === 0) {
      newErrors.tools = 'Add at least one tool to audit';
    }
    formData.tools.forEach((tool, i) => {
      if (!tool.toolId) newErrors[`tool-${i}-toolId`] = 'Select a tool';
      if (!tool.planName) newErrors[`tool-${i}-planName`] = 'Select a plan';
      if (tool.monthlySpend <= 0) newErrors[`tool-${i}-monthlySpend`] = 'Enter your monthly spend';
      if (tool.seats < 1) newErrors[`tool-${i}-seats`] = 'Minimum 1 seat';
    });
    if (formData.teamSize < 1) newErrors.teamSize = 'Enter your team size';
    if (!formData.useCase) newErrors.useCase = 'Select a use case';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    // Save to localStorage and navigate
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    // Also save audit input for results page
    sessionStorage.setItem('audit-input', JSON.stringify(formData));
    navigate('/results');
  };

  const totalMonthly = formData.tools.reduce((sum, t) => sum + (t.monthlySpend || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-orange-500" />
            <span className="font-semibold text-sm">AI Spend Audit</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {step === 0 ? 'Step 1 of 2' : 'Step 2 of 2'}
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[0, 1].map(s => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-orange-500' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {step === 0 ? (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight mb-1">What AI tools do you pay for?</h1>
              <p className="text-muted-foreground">Add each tool your team uses. Select the plan, your actual monthly spend, and number of seats.</p>
            </div>

            {errors.tools && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200">
                {errors.tools}
              </div>
            )}

            <div className="space-y-4">
              {formData.tools.map((tool, index) => {
                const toolDef = AI_TOOLS.find(t => t.id === tool.toolId);
                const Icon = toolDef ? TOOL_ICONS[toolDef.id] || Zap : Zap;
                return (
                  <Card key={index} className="border-border/60">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">Tool #{index + 1}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTool(index)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3">
                        {/* Tool Select */}
                        <div>
                          <Label className="text-xs font-medium mb-1.5 block">Tool</Label>
                          <Select
                            value={tool.toolId}
                            onValueChange={(v) => updateTool(index, 'toolId', v)}
                          >
                            <SelectTrigger className={errors[`tool-${index}-toolId`] ? 'border-red-300' : ''}>
                              <SelectValue placeholder="Select tool" />
                            </SelectTrigger>
                            <SelectContent>
                              {AI_TOOLS.map(t => (
                                <SelectItem key={t.id} value={t.id}>
                                  <div className="flex items-center gap-2">
                                    {(() => {
                                      const I = TOOL_ICONS[t.id] || Zap;
                                      return <I className="h-4 w-4" />;
                                    })()}
                                    {t.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors[`tool-${index}-toolId`] && (
                            <p className="text-xs text-red-500 mt-1">{errors[`tool-${index}-toolId`]}</p>
                          )}
                        </div>

                        {/* Plan Select */}
                        <div>
                          <Label className="text-xs font-medium mb-1.5 block">Plan</Label>
                          <Select
                            value={tool.planName}
                            onValueChange={(v) => updateTool(index, 'planName', v)}
                            disabled={!tool.toolId}
                          >
                            <SelectTrigger className={errors[`tool-${index}-planName`] ? 'border-red-300' : ''}>
                              <SelectValue placeholder="Select plan" />
                            </SelectTrigger>
                            <SelectContent>
                              {toolDef?.plans.map(p => (
                                <SelectItem key={p.name} value={p.name}>
                                  {p.name} {p.monthlyPrice > 0 ? `($${p.monthlyPrice}/mo)` : '(Free)'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors[`tool-${index}-planName`] && (
                            <p className="text-xs text-red-500 mt-1">{errors[`tool-${index}-planName`]}</p>
                          )}
                        </div>

                        {/* Monthly Spend */}
                        <div>
                          <Label className="text-xs font-medium mb-1.5 block">Monthly Spend ($)</Label>
                          <Input
                            type="number"
                            min={0}
                            placeholder="e.g. 200"
                            value={tool.monthlySpend || ''}
                            onChange={(e) => updateTool(index, 'monthlySpend', Number(e.target.value))}
                            className={errors[`tool-${index}-monthlySpend`] ? 'border-red-300' : ''}
                          />
                          {errors[`tool-${index}-monthlySpend`] && (
                            <p className="text-xs text-red-500 mt-1">{errors[`tool-${index}-monthlySpend`]}</p>
                          )}
                        </div>

                        {/* Seats */}
                        <div>
                          <Label className="text-xs font-medium mb-1.5 block">Seats</Label>
                          <Input
                            type="number"
                            min={1}
                            placeholder="1"
                            value={tool.seats || ''}
                            onChange={(e) => updateTool(index, 'seats', Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Button
              variant="outline"
              className="w-full mt-4 border-dashed"
              onClick={addTool}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Another Tool
            </Button>

            {formData.tools.length > 0 && (
              <div className="mt-6 flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Total monthly spend</span>
                <span className="text-xl font-bold">${totalMonthly.toLocaleString()}</span>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <Button
                size="lg"
                onClick={() => {
                  if (formData.tools.length === 0) {
                    setErrors({ tools: 'Add at least one tool to audit' });
                    return;
                  }
                  setStep(1);
                }}
                disabled={formData.tools.length === 0}
              >
                Continue
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight mb-1">About your team</h1>
              <p className="text-muted-foreground">Help us tailor recommendations to your team profile.</p>
            </div>

            <Card className="border-border/60">
              <CardContent className="pt-6 space-y-6">
                {/* Team Size */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Team Size
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={10000}
                    placeholder="e.g. 12"
                    value={formData.teamSize || ''}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, teamSize: Number(e.target.value) }));
                      setErrors(prev => { const n = { ...prev }; delete n.teamSize; return n; });
                    }}
                    className={errors.teamSize ? 'border-red-300' : ''}
                  />
                  {errors.teamSize && <p className="text-xs text-red-500 mt-1">{errors.teamSize}</p>}
                  <p className="text-xs text-muted-foreground mt-1">Total people on your team who use AI tools</p>
                </div>

                <Separator />

                {/* Use Case */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    Primary Use Case
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {USE_CASES.map(uc => (
                      <button
                        key={uc.value}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, useCase: uc.value }));
                          setErrors(prev => { const n = { ...prev }; delete n.useCase; return n; });
                        }}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          formData.useCase === uc.value
                            ? 'border-orange-500 bg-orange-50 text-orange-900'
                            : 'border-border hover:border-muted-foreground/50'
                        }`}
                      >
                        <div className="font-medium text-sm">{uc.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{uc.desc}</div>
                      </button>
                    ))}
                  </div>
                  {errors.useCase && <p className="text-xs text-red-500 mt-2">{errors.useCase}</p>}
                </div>

                <Separator />

                {/* Summary */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Audit summary</span>
                    <Badge variant="secondary">{formData.tools.length} tools</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {formData.tools.map((t, i) => {
                      const td = AI_TOOLS.find(x => x.id === t.toolId);
                      return (
                        <div key={i} className="flex justify-between">
                          <span>{td?.name} ({t.planName})</span>
                          <span className="font-medium">${t.monthlySpend}/mo</span>
                        </div>
                      );
                    })}
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total monthly</span>
                    <span>${totalMonthly.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 flex items-center justify-between">
              <Button variant="outline" onClick={() => setStep(0)}>
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
              <Button size="lg" onClick={handleSubmit} className="px-8">
                <Zap className="mr-2 h-4 w-4" />
                Run Audit
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
