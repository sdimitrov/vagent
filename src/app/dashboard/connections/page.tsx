import React from 'react';
import { auth } from '@clerk/nextjs/server';
import { getDb } from '@/db';
import { socialConnections } from '@/db/schema';
import { eq } from 'drizzle-orm';
import ConnectAccountButtons from './components/ConnectAccountButtons';
import ConnectedAccountsList from './components/ConnectedAccountsList';
import AlertMessages from './components/AlertMessages'; // For handling success/error query params

export interface SocialConnectionDisplay {
  id: string;
  platform: string;
  platformUserId: string;
  platformUsername: string | null;
  connectionStatus: string;
  connectedAt: string; // Mapped from schema.createdAt (ISO string)
  updatedAt: Date | null; // from schema.updatedAt
  lastValidatedAt: Date | null; // from schema.lastValidatedAt
}

export default async function ConnectionsPage({ searchParams: searchParamsPromise }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await searchParamsPromise || {}; // Await and provide a default empty object
  const authResult = await auth();
  const userId = authResult.userId;

  let fetchedConnections: SocialConnectionDisplay[] = [];
  let dbError: string | null = null;

  // Extract specific searchParams on the server to pass to the client component
  const errorParam = searchParams?.error as string | undefined;
  const successParam = searchParams?.success as string | undefined;
  const platformParam = searchParams?.platform as string | undefined;
  const messageParam = searchParams?.message as string | undefined; // For generic messages
  const statusParam = searchParams?.status as string | undefined; // For generic messages type

  if (!userId) {
    // Clerk middleware should handle actual redirection to sign-in.
    // This block primarily handles the case where the page is rendered without a user session.
    // For now, it will result in an empty `fetchedConnections` list.
  } else {
    try {
      const db = await getDb();
      const connectionsFromDb = await db
        .select({
          id: socialConnections.id,
          platform: socialConnections.platform,
          platformUserId: socialConnections.platformUserId,
          platformUsername: socialConnections.platformUsername,
          connectionStatus: socialConnections.connectionStatus,
          createdAt: socialConnections.createdAt, 
          updatedAt: socialConnections.updatedAt,
          lastValidatedAt: socialConnections.lastValidatedAt,
        })
        .from(socialConnections)
        .where(eq(socialConnections.userId, userId));
      
      fetchedConnections = connectionsFromDb.map(conn => ({
        id: conn.id,
        platform: conn.platform,
        platformUserId: conn.platformUserId,
        platformUsername: conn.platformUsername,
        connectionStatus: conn.connectionStatus,
        // Ensure connectedAt is a string; provide a fallback if createdAt is unexpectedly null.
        connectedAt: conn.createdAt ? (conn.createdAt instanceof Date ? conn.createdAt.toISOString() : String(conn.createdAt)) : new Date().toISOString(),
        updatedAt: conn.updatedAt,
        lastValidatedAt: conn.lastValidatedAt,
      }));

    } catch (e: any) {
      console.error("Failed to fetch connections:", e);
      dbError = "Could not load your connections. Please try again later.";
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8 text-slate-100">Manage Social Connections</h1>

      <AlertMessages 
        error={errorParam} 
        success={successParam} 
        platform={platformParam}
        message={messageParam}
        status={statusParam}
      />
      {dbError && (
        <div className="bg-red-500/20 border border-red-700 text-red-300 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Database Error:</strong>
          <span className="block sm:inline"> {dbError}</span>
        </div>
      )}

      <div className="bg-slate-800/50 shadow-xl rounded-xl p-6 md:p-8">
        <ConnectAccountButtons />
        <ConnectedAccountsList connections={fetchedConnections} />
      </div>
    </div>
  );
} 