import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { google } from 'googleapis'; // Import googleapis
import { getDb } from '@/db'; // Corrected: Assuming @ is configured for src path
import { socialConnections } from '@/db/schema'; // Import table directly
import { sql } from 'drizzle-orm'; // Import sql for default values if needed
import { encrypt } from '@/lib/encryption'; // Import the new encryption utility

// IMPORTANT: This is a template. Platform-specific SDKs and logic will be needed.
// You'll also need a database client and encryption/decryption utilities.

// Example: npm install googleapis (for YouTube/Google)

// Retrieve these from environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(request: Request, { params: paramsPromise }: { params: Promise<{ platform: string }> }) {
  const { platform } = await paramsPromise;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code'); // Authorization code from OAuth provider
  const error = searchParams.get('error');

  if (error) {
    console.error(`OAuth error from ${platform} callback:`, error);
    // Redirect to an error page or display a message
    return NextResponse.redirect(new URL(`/dashboard/connections?error=oauth_failed&platform=${platform}`, request.url));
  }

  if (!code) {
    console.error(`Missing authorization code from ${platform} callback`);
    return NextResponse.redirect(new URL(`/dashboard/connections?error=missing_code&platform=${platform}`, request.url));
  }

  try {
    let accessToken: string | null = null;
    let refreshToken: string | null = null;
    let platformUserId: string | null = null;
    let platformUsername: string | null = null; // Optional
    let scopesArray: string[] = []; // Granted scopes
    let expiresAt: Date | null = null;
    let tokenType: string | null = 'Bearer'; // Default for Google

    if (platform === 'youtube') {
      if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        throw new Error('Google OAuth credentials are not configured on the server.');
      }
      const oauth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        `${NEXT_PUBLIC_APP_URL}/api/oauth/youtube/callback`
      );

      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);
      
      accessToken = tokens.access_token !== undefined ? tokens.access_token : null;
      refreshToken = tokens.refresh_token !== undefined ? tokens.refresh_token : null;
      tokenType = tokens.token_type || 'Bearer';
      expiresAt = tokens.expiry_date ? new Date(tokens.expiry_date) : null;
      scopesArray = tokens.scope?.split(' ') || [];

      // Fetch user info using the access token (Google People API or YouTube API)
      // Using People API for profile info as it's more standard for basic user details
      const people = google.people({ version: 'v1', auth: oauth2Client });
      const person = await people.people.get({
        resourceName: 'people/me',
        personFields: 'names,emailAddresses', // Request specific fields
      });
      
      // Google often returns multiple names/emails, pick primary or first
      platformUserId = person.data.resourceName?.split('/')[1] || null; // Ensure null if undefined
      platformUsername = person.data.names?.[0]?.displayName || person.data.emailAddresses?.[0]?.value || null;

    } else if (platform === 'tiktok') {
      // Example for TikTok
      // ... TikTok SDK or HTTP calls to exchange code for tokens ...
      console.log('Simulating TikTok token exchange for code:', code);
      accessToken = `fake_tiktok_access_token_for_${code}`;
      refreshToken = `fake_tiktok_refresh_token_for_${code}`;
      platformUserId = `tt_user_${userId.substring(5)}`; // userId might be null here if accessed before check
      platformUsername = `TikTokUser_${userId.substring(5,10)}`; // userId might be null here
      scopesArray = ['video.upload']; // Example scopes
      expiresAt = new Date(Date.now() + 7200 * 1000); // Simulate 2 hours expiry
      tokenType = 'Bearer';

    } else {
      // Handle other platforms or throw an error for unsupported platforms
      console.error(`Unsupported platform in callback: ${platform}`);
      return NextResponse.redirect(new URL(`/dashboard/connections?error=unsupported_platform&platform=${platform}`, request.url));
    }

    if (!accessToken || !platformUserId) {
      throw new Error('Failed to retrieve access token or platform user ID after token exchange.');
    }

    // --- Encrypt Tokens --- 
    const encryptedAccessToken = encrypt(accessToken!); // Use new encrypt function
    const encryptedRefreshToken = refreshToken ? encrypt(refreshToken) : null; // Encrypt if refresh token exists

    if (!encryptedAccessToken) { // Check if encryption failed (e.g. key not set)
      throw new Error('Failed to encrypt access token. Ensure ENCRYPTION_KEY is set.');
    }
    // Note: If refreshToken exists and its encryption fails, encryptedRefreshToken will be null.
    // The schema allows refreshToken to be null, so this is acceptable.

    // --- Database Interaction --- 
    const db = await getDb();

    // Correctly infer the insert type from the imported table definition
    const valuesToInsert: typeof socialConnections.$inferInsert = {
      userId: userId,
      platform: platform,
      platformUserId: platformUserId,
      platformUsername: platformUsername,
      accessToken: encryptedAccessToken!, 
      refreshToken: encryptedRefreshToken,
      scopes: scopesArray.join(','),
      tokenType: tokenType,
      expiresAt: expiresAt,
      connectionStatus: 'active',
      lastValidatedAt: new Date(),
      // createdAt and updatedAt will use default SQL now() via schema definition
    };

    await db.insert(socialConnections)
      .values(valuesToInsert)
      .onConflictDoUpdate({
        target: [socialConnections.userId, socialConnections.platform, socialConnections.platformUserId],
        // Ensure all fields that can be updated are listed here
        set: {
          accessToken: encryptedAccessToken!, 
          refreshToken: encryptedRefreshToken,
          scopes: scopesArray.join(','),
          tokenType: tokenType,
          expiresAt: expiresAt,
          platformUsername: platformUsername, 
          connectionStatus: 'active',
          lastValidatedAt: new Date(),
          updatedAt: sql`now()`,
        }
      });

    console.log(`Successfully upserted YouTube connection for user ${userId}, platformUserId ${platformUserId}`);

    // Redirect to a success page or back to the connections management page
    return NextResponse.redirect(new URL(`/dashboard/connections?success=true&platform=${platform}`, request.url));

  } catch (err: any) {
    console.error(`Error processing OAuth callback for ${platform}:`, err.message, err.stack);
    // It's good practice to log the detailed error but not expose it to the user directly.
    let errorMessage = 'oauth_processing_failed';
    if (err.response?.data?.error_description) { // Google specific error format
        errorMessage = err.response.data.error_description;
    } else if (err.message && (err.message.includes('token') || err.message.includes('credentials'))) {
        errorMessage = 'token_exchange_or_config_failed';
    }
    return NextResponse.redirect(new URL(`/dashboard/connections?error=${encodeURIComponent(errorMessage)}&platform=${platform}`, request.url));
  }
}
