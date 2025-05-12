'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams as useClientSearchParams, useRouter } from 'next/navigation'; // Renamed to avoid confusion

interface AlertMessagesProps {
  error?: string;
  success?: string;
  platform?: string;
  message?: string; // Generic message from server
  status?: string;  // Type for generic message (e.g., 'success' or 'error')
}

export default function AlertMessages({
  error: serverError,
  success: serverSuccess,
  platform: serverPlatform,
  message: serverMessage,
  status: serverStatus,
}: AlertMessagesProps) {
  const clientSearchParams = useClientSearchParams(); // For client-side URL clearing
  const router = useRouter(); // router might not be needed if only clearing URL client-side
  const [displayMessage, setDisplayMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    let builtMessage: string | null = null;
    let type: 'success' | 'error' | null = null;

    if (serverSuccess === 'true' && serverPlatform) {
      builtMessage = `Successfully connected to ${serverPlatform}!`;
      type = 'success';
    } else if (serverError && serverPlatform) {
      const decodedError = decodeURIComponent(serverError);
      builtMessage = `Connection to ${serverPlatform} failed: ${decodedError}. Please try again.`;
      type = 'error';
    } else if (serverError) {
      const decodedError = decodeURIComponent(serverError);
      builtMessage = `An error occurred: ${decodedError}.`;
      type = 'error';
    } else if (serverMessage) {
      builtMessage = decodeURIComponent(serverMessage);
      type = serverStatus === 'error' ? 'error' : 'success';
    }

    if (builtMessage) {
      setDisplayMessage(builtMessage);
      setMessageType(type);

      // Clear query params from URL after displaying message
      const newSearchParams = new URLSearchParams(clientSearchParams.toString());
      newSearchParams.delete('error');
      newSearchParams.delete('success');
      newSearchParams.delete('platform');
      newSearchParams.delete('message');
      newSearchParams.delete('status');
      
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const newUrl = newSearchParams.toString() ? `${currentPath}?${newSearchParams.toString()}` : currentPath;
        window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
      }
    }
  // Effect should run if any of the server-passed props change.
  // clientSearchParams is stable, router is stable. Adding them mostly for linting completeness if they were used more deeply.
  }, [serverError, serverSuccess, serverPlatform, serverMessage, serverStatus, clientSearchParams, router]);

  if (!displayMessage || !messageType) {
    return null;
  }

  const baseClasses = "px-4 py-3 rounded relative mb-6 text-sm";
  const typeClasses = messageType === 'success' 
    ? "bg-green-500/20 border border-green-700 text-green-200"
    : "bg-red-500/20 border border-red-700 text-red-300";

  return (
    <div className={`${baseClasses} ${typeClasses}`} role="alert">
      <strong className="font-bold">{messageType === 'success' ? 'Success' : 'Error'}: </strong>
      <span className="block sm:inline">{displayMessage}</span>
      <button 
        onClick={() => setDisplayMessage(null)} 
        className="absolute top-0 bottom-0 right-0 px-4 py-3 text-lg font-semibold"
        aria-label="Dismiss message"
      >
        &times;
      </button>
    </div>
  );
} 