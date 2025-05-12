'use client';

import React from 'react';

const SUPPORTED_PLATFORMS = [
  { id: 'youtube', name: 'YouTube', icon: 'Y', description: 'Upload videos, manage channel.' },
  { id: 'tiktok', name: 'TikTok', icon: 'T', description: 'Share short videos with the world.' },
  // { id: 'instagram', name: 'Instagram', icon: 'I', description: 'Share photos and reels.' }, // Placeholder
  // { id: 'twitter', name: 'X (Twitter)', icon: 'X', description: 'Share updates and news.' }, // Placeholder
  // { id: 'facebook', name: 'Facebook', icon: 'F', description: 'Connect with your audience.' }, // Placeholder
];

export default function ConnectAccountButtons() {
  const handleConnect = (platformId: string) => {
    window.location.href = `/api/oauth/${platformId}/authorize`;
  };

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-semibold mb-6 text-slate-200">Connect New Account</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {SUPPORTED_PLATFORMS.map(platform => (
          <button
            key={platform.id}
            onClick={() => handleConnect(platform.id)}
            className="w-full flex flex-col items-start p-5 bg-slate-700 hover:bg-slate-600/80 text-slate-100 rounded-lg transition duration-150 ease-in-out shadow-lg hover:shadow-slate-600/50 transform hover:-translate-y-1"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-slate-600 p-2 rounded-md text-xl font-bold">{platform.icon}</span>
              <span className="text-lg font-semibold">{platform.name}</span>
            </div>
            <p className="text-sm text-slate-300 text-left">{platform.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
} 