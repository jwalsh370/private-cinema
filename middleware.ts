import { NextRequest, NextResponse } from 'next/server';
import { validateEnv } from '@/lib/env';

// Validate environment variables on first request
let envChecked = false;

export function middleware(request: NextRequest) {
  // Environment check (once per server instance)
  if (!envChecked) {
    try {
      validateEnv();
      envChecked = true;
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
  }

  // Security headers for all responses
  const response = NextResponse.next();
  
  // Core security headers
  response.headers.set('Content-Security-Policy', "default-src 'self'");
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    response.headers.set('Access-Control-Allow-Origin', 
      process.env.NEXT_PUBLIC_BASE_URL || '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  }

  return response;
}

// Only run middleware on relevant paths
export const config = {
  matcher: [
    '/',
    '/api/:path*',
  ],
};
