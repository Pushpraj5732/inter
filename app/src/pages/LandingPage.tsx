import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ArrowRight,
  Zap,
  Shield,
  TrendingDown,
  Clock,
  BarChart3,
  Users,
  Lock,
  Share2,
  CheckCircle2,
  Sparkles,
  Code2,
  MessageSquare,
  Bot,
  Github,
  Wind,
} from 'lucide-react';

const FEATURED_TOOLS = [
  { name: 'Cursor', icon: Code2, color: 'text-emerald-400' },
  { name: 'GitHub Copilot', icon: Github, color: 'text-gray-400' },
  { name: 'Claude', icon: Bot, color: 'text-amber-400' },
  { name: 'ChatGPT', icon: MessageSquare, color: 'text-green-400' },
  { name: 'Windsurf', icon: Wind, color: 'text-sky-400' },
  { name: 'Gemini', icon: Sparkles, color: 'text-blue-400' },
];

const TESTIMONIALS = [
  {
    quote: 'Found $340/month in savings we had no idea about. Took literally 2 minutes.',
    author: 'Engineering Lead, Series A Startup',
  },
  {
    quote: 'Downgraded our Cursor Business plan and saved $720/year. The audit was spot on.',
    author: 'CTO, 8-person dev team',
  },
  {
    quote: 'Switched from ChatGPT Enterprise to Team — same features, half the price for our size.',
    author: 'VP Engineering, Seed-stage',
  },
];

const FAQ_ITEMS = [
  {
    q: 'How does the audit work?',
    a: 'You tell us which AI tools you pay for, what plan you\'re on, your team size, and how you use them. Our engine compares your setup against current pricing data and recommends specific optimizations — plan downgrades, annual billing, or alternative tools.',
  },
  {
    q: 'Is this really free?',
    a: 'Yes, 100% free. No credit card required. We make money when we help you save significantly and connect you with discounted AI infrastructure credits through Credex.',
  },
  {
    q: 'Which tools do you support?',
    a: 'We audit Cursor, GitHub Copilot, Claude, ChatGPT, OpenAI API, Anthropic API, Gemini, and Windsurf. We\'re adding new tools every week based on user requests.',
  },
  {
    q: 'How accurate is the pricing data?',
    a: 'We pull pricing directly from each vendor\'s official website weekly. Every number in our audit engine traces back to a source URL. If you spot something out of date, let us know and we\'ll fix it within 24 hours.',
  },
  {
    q: 'Do you store my data?',
    a: 'We only store what you explicitly share. The audit runs client-side; we don\'t see your inputs unless you choose to save your results. Shareable URLs strip identifying details — only tools and savings numbers are visible.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            <span className="font-bold text-lg tracking-tight">AI Spend Audit</span>
            <Badge variant="secondary" className="text-xs ml-1">by Credex</Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">Free audit</span>
            <Button size="sm" onClick={() => navigate('/audit')}>
              Start Audit
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-background dark:from-orange-950/20 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-28 relative">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-6 text-sm px-4 py-1.5">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              Now covering 8 AI tools with live pricing
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              Stop overpaying for{' '}
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                AI tools
              </span>{' '}
              you barely use
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Get a free, instant audit of your AI tool spend. Find specific savings on Cursor, Copilot, ChatGPT, Claude & more — with defensible reasoning and current pricing.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
              <Button size="lg" onClick={() => navigate('/audit')} className="text-lg px-8 h-12">
                <Zap className="mr-2 h-5 w-5" />
                Audit My Spend — Free
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/audit')} className="text-lg px-8 h-12">
                See How It Works
              </Button>
            </div>

            {/* Tool logos */}
            <div className="flex flex-wrap justify-center gap-6 items-center opacity-60">
              {FEATURED_TOOLS.map(tool => (
                <div key={tool.name} className="flex items-center gap-1.5 text-sm font-medium">
                  <tool.icon className={`h-4 w-4 ${tool.color}`} />
                  {tool.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* How It Works */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-3">How it works</h2>
            <p className="text-muted-foreground text-lg">From input to savings in 60 seconds</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Clock, step: '1', title: 'Add your tools', desc: 'Select which AI tools you pay for, your plan tier, and monthly spend.' },
              { icon: BarChart3, step: '2', title: 'Run the audit', desc: 'Our engine evaluates each tool against current pricing and your team profile.' },
              { icon: TrendingDown, step: '3', title: 'See savings', desc: 'Get per-tool recommendations with specific dollar amounts and reasoning.' },
              { icon: Share2, step: '4', title: 'Share results', desc: 'Get a unique public URL to share your audit — perfect for Twitter or Slack.' },
            ].map(item => (
              <Card key={item.step} className="border-border/50 hover:border-orange-200 transition-colors">
                <CardContent className="pt-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4 font-bold">
                    {item.step}
                  </div>
                  <item.icon className="h-6 w-6 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold mb-1.5">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Features */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-3">Why teams trust our audit</h2>
            <p className="text-muted-foreground text-lg">Built for engineering leaders who take spend seriously</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Defensible reasoning', desc: 'Every recommendation includes a one-sentence rationale. A finance person would agree with our logic — no hand-waving.' },
              { icon: Lock, title: 'Privacy-first', desc: 'No login required. Audit runs in your browser. We only store data if you explicitly save results. Shareable URLs strip identifying info.' },
              { icon: Users, title: 'Team-aware', desc: 'We factor in team size, use case, and per-seat economics. A 2-person team on Enterprise gets different advice than a 50-person org.' },
              { icon: CheckCircle2, title: 'Honest about savings', desc: 'If you\'re already optimized, we\'ll tell you. We don\'t manufacture fake savings. Our credibility is worth more than a lead.' },
              { icon: Zap, title: 'Live pricing', desc: 'Pricing data sourced from vendor websites and updated weekly. Every number traces back to an official source with verification date.' },
              { icon: Sparkles, title: 'AI-powered summary', desc: 'Get a personalized ~100 word summary written by Claude 3.5 Sonnet, with graceful fallback to templated summaries if the API is unavailable.' },
            ].map(f => (
              <div key={f.title} className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Social Proof */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-3">Social Proof (Mocked)</Badge>
            <h2 className="text-3xl font-bold tracking-tight mb-3">What teams are saying</h2>
            <p className="text-muted-foreground">Real feedback from beta users</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="pt-6">
                  <p className="text-lg italic mb-4 leading-relaxed">"{t.quote}"</p>
                  <p className="text-sm text-muted-foreground font-medium">— {t.author}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* FAQ */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-3">Frequently asked</h2>
            <p className="text-muted-foreground">Everything you need to know</p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left font-semibold">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Ready to find your savings?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join 500+ teams who've audited their AI tool spend. Takes 60 seconds. Completely free.
          </p>
          <Button size="lg" onClick={() => navigate('/audit')} className="text-lg px-8 h-12">
            <Zap className="mr-2 h-5 w-5" />
            Start My Free Audit
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            No signup required. No credit card. Audit runs in your browser.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="h-4 w-4 text-orange-500" />
            AI Spend Audit — A Credex project
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>Built for the Credex intern assignment</span>
            <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              credex.rocks
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
