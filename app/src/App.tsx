import { Routes, Route, useLocation, useParams } from 'react-router';
import { useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import AuditPage from './pages/AuditPage';
import ResultsPage from './pages/ResultsPage';
import SharePage from './pages/SharePage';
import { Toaster } from '@/components/ui/sonner';

// OG Meta tag manager
function MetaTags() {
  const location = useLocation();
  const params = useParams();

  useEffect(() => {
    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        const attrName = selector.includes('property=') ? 'property' : 'name';
        const attrValue = selector.match(/="([^"]+)"/)?.[1] || '';
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    if (location.pathname.startsWith('/share/')) {
      setMeta('meta[property="og:title"]', 'content', 'AI Spend Audit Results');
      setMeta('meta[property="og:description"]', 'content', `See how much this team could save on AI tools — get your own free audit.`);
      setMeta('meta[property="og:type"]', 'content', 'website');
      setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
      setMeta('meta[name="twitter:title"]', 'content', 'AI Spend Audit Results');
      setMeta('meta[name="twitter:description"]', 'content', `See how much this team could save on AI tools — get your own free audit.`);
    } else if (location.pathname === '/results') {
      setMeta('meta[property="og:title"]', 'content', 'My AI Spend Audit Results');
      setMeta('meta[property="og:description"]', 'content', 'I just audited my AI tool spend — here are my results.');
      setMeta('meta[name="twitter:card"]', 'content', 'summary');
    } else {
      // Default / landing
      setMeta('meta[property="og:title"]', 'content', 'AI Spend Audit — Find Hidden Savings on Your AI Tools');
      setMeta('meta[property="og:description"]', 'content', 'Free audit for Cursor, Copilot, ChatGPT, Claude & more. See where you\'re overspending in 60 seconds.');
      setMeta('meta[property="og:type"]', 'content', 'website');
      setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
      setMeta('meta[name="twitter:title"]', 'content', 'AI Spend Audit — Free AI Tool Cost Optimizer');
      setMeta('meta[name="twitter:description"]', 'content', 'Audit your AI tool spend in 60 seconds. Find savings on Cursor, Copilot, ChatGPT, Claude & more.');
    }
  }, [location, params]);

  return null;
}

export default function App() {
  return (
    <>
      <MetaTags />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/audit" element={<AuditPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/share/:shareId" element={<SharePage />} />
      </Routes>
      <Toaster position="bottom-right" />
    </>
  );
}
