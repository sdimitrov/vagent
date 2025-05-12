'use client';

import React, { useState, useRef } from 'react';

export default function UploaderPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setUploadMessage(null); // Clear previous messages
      setUploadError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setUploadError('Please select a video file to upload.');
      return;
    }
    if (!title.trim()) {
      setUploadError('Please enter a title for your video.');
      return;
    }

    setIsUploading(true);
    setUploadMessage(null);
    setUploadError(null);

    const formData = new FormData();
    formData.append('videoFile', file);
    formData.append('title', title);
    formData.append('description', description);

    try {
      const response = await fetch('/api/youtube/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to upload: ${response.statusText}`);
      }

      setUploadMessage(`Upload successful (simulated)! Video ID: ${result.videoId || 'N/A'}`);
      // Clear form
      setFile(null);
      setTitle('');
      setDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset file input
      }

    } catch (err: any) {
      console.error('Upload failed:', err);
      setUploadError(err.message || 'An unexpected error occurred during upload.');
    }
    setIsUploading(false);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8 text-slate-100">Upload Video to YouTube</h1>

      <div className="bg-slate-800/50 shadow-xl rounded-xl p-6 md:p-8 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="videoFile" className="block text-sm font-medium text-slate-300 mb-1">
              Video File
            </label>
            <input
              type="file"
              id="videoFile"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="video/*"
              className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-600 file:text-sky-50 hover:file:bg-sky-700 disabled:opacity-50 disabled:pointer-events-none"
              disabled={isUploading}
            />
            {file && <p className='text-xs text-slate-400 mt-1'>Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>}
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Awesome Video"
              className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 text-slate-100 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:opacity-50"
              disabled={isUploading}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="A brief description of your video content..."
              className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 text-slate-100 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:opacity-50"
              disabled={isUploading}
            />
          </div>

          {uploadMessage && (
            <div className="bg-green-500/20 border border-green-700 text-green-200 px-4 py-3 rounded text-sm">
              {uploadMessage}
            </div>
          )}
          {uploadError && (
            <div className="bg-red-500/20 border border-red-700 text-red-300 px-4 py-3 rounded text-sm">
              {uploadError}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isUploading || !file}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
            >
              {isUploading ? 'Uploading...' : 'Upload to YouTube'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 