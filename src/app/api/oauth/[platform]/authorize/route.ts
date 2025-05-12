import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { randomBytes } from 'crypto';

// IMPORTANT: This is a template. Platform-specific Client IDs, Scopes, and base URLs are needed.
// These should be stored securely, likely as environment variables.

const OAUTH_CONFIGS: Record<string, { clientId: string, scopes: string[], authorizationUrl: string, clientSecret?: string }> = {
  youtube: {
    clientId: process.env.GOOGLE_CLIENT_ID || '', // Ensure it uses the env var, provide fallback if needed for type
    scopes: ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/userinfo.profile'],
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '' // Add client secret for token exchange
  },
  tiktok: {
    clientId: process.env.TIKTOK_CLIENT_ID || '',
    scopes: ['user.info.basic', 'video.upload'], 
    authorizationUrl: 'https://www.tiktok.com/v2/auth/authorize/',
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || '' // Placeholder for TikTok
  },
  // Add configurations for Instagram, Twitter, Facebook here
};

export async function GET(request: Request, { params: paramsPromise }: { params: Promise<{ platform: string }> }) {
  const { platform } = await paramsPromise;
  const { userId } = await auth();

  if (!userId) {
    // If user is not authenticated, redirect to sign-in, then they can retry connection
    return NextResponse.redirect(new URL('/sign-in?redirect_url=/dashboard/connections', request.url));
  }

  const config = OAUTH_CONFIGS[platform];
  if (!config || !config.clientId) { // Also check if clientId is actually set
    console.error(`Unsupported or misconfigured platform for OAuth authorization: ${platform}`);
    // Redirect to connections page with an error
    return NextResponse.redirect(new URL(`/dashboard/connections?error=unsupported_platform_auth`, request.url));
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/${platform}/callback`;
  const state = randomBytes(16).toString('hex'); // Generate a random state for CSRF protection

  // Store the state parameter, e.g., in a short-lived cookie or server-side session associated with the user
  // For simplicity here, we are not showing session storage but it's crucial for security.
  // Example using a cookie (ensure it's HttpOnly, Secure, SameSite=Lax):
  // const response = NextResponse.redirect(...);
  // response.cookies.set(`oauth_state_${platform}`, state, { maxAge: 300, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
  // return response;
  // For the callback to verify, it would read this cookie.

  let authorizationUrlString = '';

  if (platform === 'youtube') {
    const authParams = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: config.scopes.join(' '),
      access_type: 'offline', // To get a refresh token
      prompt: 'consent',      // To ensure refresh token is granted even if user previously authorized
      state: state,
    });
    authorizationUrlString = `${config.authorizationUrl}?${authParams.toString()}`;
  } else if (platform === 'tiktok') {
    // TikTok's state parameter and scope formatting might differ.
    // TikTok for Web OAuth 2.0 uses client_key instead of client_id for some flows.
    const authParams = new URLSearchParams({
      client_key: config.clientId, // TikTok uses client_key
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: config.scopes.join(','), // TikTok scopes are comma-separated
      state: state,
      // rid: randomBytes(8).toString('hex'), // Some TikTok flows might use an `rid` parameter for additional CSRF
    });
    authorizationUrlString = `${config.authorizationUrl}?${authParams.toString()}`;
  } else {
    // Generic approach for other platforms, adjust as needed
    // This part should ideally not be reached if config is validated properly
    console.error(`Platform ${platform} has no specific auth URL construction logic.`);
    return NextResponse.redirect(new URL(`/dashboard/connections?error=platform_config_error`, request.url));
  }

  console.log(`Redirecting user ${userId} to ${platform} OAuth: ${authorizationUrlString.substring(0, 100)}...`);
  // In a real app, you MUST save the `state` associated with the user session to verify it in the callback.
  // For example, set an HttpOnly cookie with the state value.
  const response = NextResponse.redirect(new URL(authorizationUrlString));
  // Example: response.cookies.set(`oauth_state_${platform}_${userId}`, state, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 300 });
  return response;
} 