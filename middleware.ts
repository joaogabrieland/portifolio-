import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// --- CORS ---
const ALLOWED_ORIGINS = [
  'https://creatorflowia.com',
  'https://www.creatorflowia.com',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
];

// --- Rate Limiting ---
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 200; // 200 requests per minute per IP

// --- Auth Rate Limiting (stricter) ---
const authRateLimitMap = new Map<string, { count: number; resetTime: number }>();
const AUTH_RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const AUTH_RATE_LIMIT_MAX_LOGIN = 5; // 5 login attempts per minute per IP
const AUTH_RATE_LIMIT_MAX_REGISTER = 3; // 3 registrations per minute per IP

// --- Bot Protection ---
const BOT_PATTERNS = [
  'python-requests',
  'python-urllib',
  'curl/',
  'wget/',
  'scrapy',
  'httpclient',
  'java/',
  'libwww-perl',
  'go-http-client',
  'node-fetch',
  'axios/',
  'postman',
  'insomnia',
];

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
}

function checkAuthRateLimit(ip: string, maxAttempts: number): { allowed: boolean } {
  const now = Date.now();
  const key = `auth:${ip}`;
  const entry = authRateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    authRateLimitMap.set(key, { count: 1, resetTime: now + AUTH_RATE_LIMIT_WINDOW });
    return { allowed: true };
  }

  entry.count++;
  if (entry.count > maxAttempts) {
    return { allowed: false };
  }

  return { allowed: true };
}

function isBot(request: NextRequest): boolean {
  const ua = (request.headers.get('user-agent') || '').toLowerCase();
  if (!ua) return true; // No user-agent = suspicious
  return BOT_PATTERNS.some((pattern) => ua.includes(pattern));
}

function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// Clean up stale rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
  for (const [key, value] of authRateLimitMap) {
    if (now > value.resetTime) {
      authRateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Skip rate limiting for health and webhook only ---
  if (pathname === '/api/health' || pathname === '/api/stripe/webhook') {
    return addSecurityHeaders(NextResponse.next(), request);
  }

  // --- Auth routes: separate stricter rate limiting ---
  // /api/auth/me is a read-only identity endpoint (Bearer-authenticated),
  // NOT a brute-force target — use the general 200/min rate limit instead.
  if (pathname.startsWith('/api/auth/') && pathname !== '/api/auth/me') {
    const ip = getClientIp(request);
    const maxAttempts = pathname.includes('/login') ? AUTH_RATE_LIMIT_MAX_LOGIN : AUTH_RATE_LIMIT_MAX_REGISTER;
    const { allowed } = checkAuthRateLimit(ip, maxAttempts);

    if (!allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Aguarde 1 minuto.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    return addSecurityHeaders(NextResponse.next(), request);
  }

  // --- Bot protection for API routes ---
  if (pathname.startsWith('/api/') && isBot(request)) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  // --- CORS enforcement for API routes ---
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
  }

  // --- Rate limiting for API routes ---
  if (pathname.startsWith('/api/')) {
    const ip = getClientIp(request);
    const { allowed, remaining } = checkRateLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        { error: 'Muitas requisições. Tente novamente em 1 minuto.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // Reject oversized request bodies (50MB general, 500MB for video uploads)
    const contentLength = request.headers.get('content-length');
    const isVideoUpload = pathname.match(/^\/api\/cliente\/[^/]+\/videos$/);
    const maxSize = isVideoUpload ? 500 * 1024 * 1024 : 50 * 1024 * 1024;
    if (contentLength && parseInt(contentLength) > maxSize) {
      return NextResponse.json(
        { error: 'Requisição muito grande.' },
        { status: 413 }
      );
    }

    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_MAX));
    response.headers.set('X-RateLimit-Remaining', String(remaining));
    return addSecurityHeaders(response, request);
  }

  // --- Security headers for all other routes ---
  const response = NextResponse.next();
  return addSecurityHeaders(response, request);
}

function addSecurityHeaders(response: NextResponse, request: NextRequest): NextResponse {
  // Request ID for tracing
  const requestId = generateRequestId();
  response.headers.set('X-Request-ID', requestId);

  // CORS headers for API routes
  const origin = request.headers.get('origin');
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // XSS protection (legacy browsers)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // HTTPS enforcement
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );

  // DNS prefetch control
  response.headers.set('X-DNS-Prefetch-Control', 'off');

  // Cross-domain policies
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  // Restrict browser features (allow camera + mic for audio/image features)
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), camera=(self), microphone=(self), accelerometer=(), gyroscope=()'
  );

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      // unsafe-inline needed for Next.js inline scripts; unsafe-eval removed for security
      // TODO: Replace unsafe-inline with nonce-based CSP when Next.js adds native nonce support
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://images.unsplash.com https://cdn.pixabay.com https://upload.wikimedia.org",
      "media-src 'self' blob:",
      "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://generativelanguage.googleapis.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
