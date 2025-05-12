'use client';

import React, { useState } from 'react';
import type { SocialConnectionDisplay } from '../page'; // Import the shared type

interface ConnectedAccountsListProps {
  connections: SocialConnectionDisplay[];
}

// Re-define SUPPORTED_PLATFORMS or import from a shared constants file if it grows
const SUPPORTED_PLATFORMS_ICONS: Record<string, string> = {
  youtube: 'Y',
  tiktok: 'T',
  instagram: 'I',
  twitter: 'X',
  facebook: 'F',
  default: 'P'
};

export default function ConnectedAccountsList({ connections: initialConnections }: ConnectedAccountsListProps) {
  const [connections, setConnections] = useState<SocialConnectionDisplay[]>(initialConnections);
  const [isLoading, setIsLoading] = useState(false); // For individual disconnect operations
  // Add a state for error messages related to disconnection
  const [disconnectError, setDisconnectError] = useState<string | null>(null);

  const handleDisconnect = async (connectionId: string, platform: string) => {
    if (!confirm(`Are you sure you want to disconnect your ${platform} account? This action cannot be undone.`)) return;
    
    setIsLoading(true);
    setDisconnectError(null); // Clear previous errors
    console.log(`Attempting to disconnect ${connectionId} (${platform})`);

    try {
      const response = await fetch(`/api/connections/${connectionId}`, { 
        method: 'DELETE' 
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to disconnect account. Please try again.' }));
        throw new Error(errorData.message || 'Failed to disconnect account.');
      }
      
      // On successful deletion from backend, update the local state
      setConnections(prev => prev.filter(c => c.id !== connectionId));
      // Optionally, show a success message (e.g., via a toast or the existing AlertMessages component if adapted)
      // For now, no explicit success alert to avoid alert fatigue, success is implied by removal.

    } catch (error: any) {
      console.error("Disconnect error:", error);
      setDisconnectError(`Failed to disconnect ${platform}: ${error.message}`);
      // alert(`Failed to disconnect ${platform}: ${error.message}`); // Replaced by state update
    }
    setIsLoading(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-slate-200">Connected Accounts</h2>
      {disconnectError && (
        <div className="bg-red-500/20 border border-red-700 text-red-300 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {disconnectError}</span>
          <button onClick={() => setDisconnectError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <span className="text-2xl leading-none">&times;</span>
          </button>
        </div>
      )}
      {initialConnections.length === 0 && !isLoading && connections.length === 0 ? (
        <p className="text-slate-400 italic">No accounts connected yet. Connect one above to get started!</p>
      ) : (
        <ul className="space-y-5">
          {connections.map(conn => (
            <li 
              key={conn.id} 
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-700/70 p-5 rounded-xl shadow-lg hover:shadow-slate-600/60 transition-shadow duration-150"
            >
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <span className="bg-slate-600 p-3 rounded-lg text-xl font-bold text-slate-100">
                  {SUPPORTED_PLATFORMS_ICONS[conn.platform.toLowerCase()] || SUPPORTED_PLATFORMS_ICONS.default}
                </span>
                <div>
                  <span className="font-semibold text-slate-100 text-lg capitalize">{conn.platform}</span>
                  {conn.platformUsername && <span className="text-sm text-slate-300 block">@{conn.platformUsername}</span>}
                  <span className="text-xs text-slate-400 block mt-1">
                    Connected: {new Date(conn.connectedAt).toLocaleDateString()} 
                    {conn.lastValidatedAt && `(Validated: ${new Date(conn.lastValidatedAt).toLocaleDateString()})`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <span 
                  className={`px-3 py-1 text-xs font-semibold rounded-full w-auto text-center 
                    ${conn.connectionStatus === 'active' ? 'bg-green-500/30 text-green-200' : 'bg-red-500/30 text-red-200'}
                    ${conn.connectionStatus === 'revoked' ? 'bg-yellow-500/30 text-yellow-200' : ''}
                  `}
                >
                  {conn.connectionStatus.charAt(0).toUpperCase() + conn.connectionStatus.slice(1)}
                </span>
                <button 
                  onClick={() => handleDisconnect(conn.id, conn.platform)}
                  disabled={isLoading} // Disable button during any disconnect operation
                  className="text-sm bg-red-600 hover:bg-red-700 disabled:bg-red-800/50 text-white font-medium py-2.5 px-5 rounded-lg transition duration-150 ease-in-out w-full sm:w-auto"
                >
                  {isLoading ? 'Processing...' : 'Disconnect'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {isLoading && connections.length > 0 && <p className="text-slate-400 mt-4 text-center">Processing request...</p> }
    </div>
  );
} 