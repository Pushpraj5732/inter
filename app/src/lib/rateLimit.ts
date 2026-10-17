// Client-side rate limiting using localStorage
const RATE_LIMIT_KEY = 'ai-audit-rate-limit';
const MAX_REQUESTS = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

interface RateLimitEntry {
  count: number;
  firstRequest: number;
}

export function checkRateLimit(): { allowed: boolean; remaining: number; resetIn: number } {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    const entry: RateLimitEntry = raw ? JSON.parse(raw) : { count: 0, firstRequest: Date.now() };

    const now = Date.now();
    if (now - entry.firstRequest > WINDOW_MS) {
      // Window expired, reset
      const newEntry: RateLimitEntry = { count: 1, firstRequest: now };
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(newEntry));
      return { allowed: true, remaining: MAX_REQUESTS - 1, resetIn: WINDOW_MS };
    }

    if (entry.count >= MAX_REQUESTS) {
      const resetIn = WINDOW_MS - (now - entry.firstRequest);
      return { allowed: false, remaining: 0, resetIn };
    }

    entry.count++;
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(entry));
    return { allowed: true, remaining: MAX_REQUESTS - entry.count, resetIn: WINDOW_MS - (now - entry.firstRequest) };
  } catch {
    // If localStorage fails, allow the request
    return { allowed: true, remaining: 1, resetIn: WINDOW_MS };
  }
}

// Honeypot check - if the hidden field has a value, it's a bot
export function isHoneypotTriggered(honeypotValue: string | undefined): boolean {
  return !!honeypotValue && honeypotValue.trim().length > 0;
}
