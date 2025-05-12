'use client';

import React, { useState, useEffect, useRef } from 'react';

type InputType = 'prompt' | 'url' | 'script';

interface GeneratedImageData {
  id: string; // Unique ID for mapping, e.g., index or original prompt
  originalPrompt: string;
  imageUrl: string | null;
  revisedPrompt: string | null;
  error: string | null;
  isLoading: boolean;
}

// Add a type for the script section
interface ScriptSection {
  section: string;
  visual: string;
  voiceover: string;
}

// Add a concurrency-limited promise pool helper
async function promisePool<T>(tasks: (() => Promise<T>)[], concurrency: number): Promise<T[]> {
  const results: T[] = [];
  let i = 0;
  async function worker() {
    while (i < tasks.length) {
      const current = i++;
      try {
        results[current] = await tasks[current]();
      } catch (e) {
        results[current] = e as T;
      }
    }
  }
  await Promise.all(Array(concurrency).fill(0).map(worker));
  return results;
}

export default function CreateVideoPage() {
  const [inputType, setInputType] = useState<InputType>('prompt');
  const [prompt, setPrompt] = useState('');
  const [url, setUrl] = useState('');
  const [directScript, setDirectScript] = useState('');
  const [isLoadingScript, setIsLoadingScript] = useState(false); // For script generation
  const [generatedScript, setGeneratedScript] = useState<ScriptSection[] | null>(null);
  const [scriptError, setScriptError] = useState<string | null>(null);

  // State for multiple image generation
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageData[]>([]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);

  const [isGeneratingVoiceovers, setIsGeneratingVoiceovers] = useState(false);
  const [voiceoverUrls, setVoiceoverUrls] = useState<(string | null)[]>([]);
  const [voiceoverErrors, setVoiceoverErrors] = useState<(string | null)[]>([]);

  // Voiceover options (remove UI, keep state if needed for future)
  // const [selectedVoiceId, setSelectedVoiceId] = useState('EXAVITQu4vr4xnSDxMaL');
  // const [selectedModelId, setSelectedModelId] = useState('eleven_monolingual_v1');
  // const [selectedLanguage, setSelectedLanguage] = useState('en');

  // Example voice/model/language options (remove UI)
  // const voiceOptions = [...];
  // const modelOptions = [...];
  // const languageOptions = [...];

  const [isComposingVideo, setIsComposingVideo] = useState(false);
  const [composeError, setComposeError] = useState<string | null>(null);
  const [composeResult, setComposeResult] = useState<{ videoUrl: string } | null>(null);
  const [composeJobId, setComposeJobId] = useState<string | null>(null);
  const [composeStatus, setComposeStatus] = useState<string | null>(null);

  const [autoAlignNotice, setAutoAlignNotice] = useState(false);

  const [imageGenWarning, setImageGenWarning] = useState<string | null>(null);
  const [voiceoverGenWarning, setVoiceoverGenWarning] = useState<string | null>(null);

  const inputTypeDisplayNames: Record<InputType, string> = { prompt: 'From Topic/Prompt', url: 'From Web URL', script: 'Write My Own Script' };

  // Only show real errors in the error display
  const filteredVoiceoverErrors = voiceoverErrors.filter(e => e && e.trim());

  const countsMatch = generatedImages.length === voiceoverUrls.length;
  const canCompose =
    generatedImages.length > 0 &&
    countsMatch &&
    generatedImages.every(img => !!img.imageUrl && !img.isLoading && !img.error) &&
    voiceoverUrls.length === generatedImages.length &&
    voiceoverUrls.every(url => typeof url === 'string' && url.trim().length > 0);

  const handleScriptSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setScriptError(null);
    setGeneratedScript(null);
    setGeneratedImages([]); // Clear previous images
    setIsGeneratingImages(false);
    setIsLoadingScript(true);

    let apiEndpoint = '';
    let requestBody: any = {};
    let errorMessagePrefix = '';

    if (inputType === 'prompt') {
      if (!prompt.trim()) { setScriptError('Prompt is required.'); setIsLoadingScript(false); return; }
      apiEndpoint = '/api/ai/generate-script'; requestBody = { prompt }; errorMessagePrefix = 'Script (prompt) failed';
    } else if (inputType === 'url') {
      if (!url.trim()) { setScriptError('URL is required.'); setIsLoadingScript(false); return; }
      try { new URL(url); } catch (_) { setScriptError('Invalid URL.'); setIsLoadingScript(false); return; }
      apiEndpoint = '/api/ai/process-url'; requestBody = { url }; errorMessagePrefix = 'Script (URL) failed';
    } else if (inputType === 'script') {
      if (!directScript.trim()) { setScriptError('Script is required.'); setIsLoadingScript(false); return; }
      try {
        const parsed = JSON.parse(directScript);
        setGeneratedScript(parsed);
      } catch {
        setScriptError('Please paste a valid JSON script.');
      }
      setIsLoadingScript(false); return;
    }

    try {
      const response = await fetch(apiEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `API request failed: ${response.statusText}`);
      // Parse the JSON script
      let parsed: ScriptSection[];
      try {
        parsed = JSON.parse(result.script);
      } catch {
        setScriptError('AI did not return valid JSON.');
        setIsLoadingScript(false);
        return;
      }
      setGeneratedScript(parsed);
    } catch (err: any) {
      console.error(`${errorMessagePrefix}:`, err);
      setScriptError(err.message || 'An unexpected error occurred.');
    }
    setIsLoadingScript(false);
  };

  const handleImageGeneration = async () => {
    if (isGeneratingVoiceovers || isGeneratingImages) {
      setImageGenWarning('Please wait for the current image or voiceover generation to finish.');
      return;
    }
    setImageGenWarning(null);
    setVoiceoverGenWarning(null);
    if (!generatedScript) {
      setScriptError('Please generate or provide a script first.');
      return;
    }
    const visuals = generatedScript.map(s => s.visual);
    if (visuals.length === 0) {
      setScriptError('No visual cues found in the script.');
      return;
    }
    setIsGeneratingImages(true);
    const initialImageStates: GeneratedImageData[] = visuals.map((prompt, index) => ({
      id: `image-${index}-${Date.now()}`,
      originalPrompt: prompt,
      imageUrl: null, revisedPrompt: null, error: null, isLoading: true,
    }));
    setGeneratedImages(initialImageStates);
    const imagePromises = visuals.map(async (prompt, index) => {
      try {
        const response = await fetch('/api/ai/generate-image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || `Image generation failed: ${response.statusText}`);
        return { index, imageUrl: result.imageUrl, revisedPrompt: result.revisedPrompt, error: null };
      } catch (err: any) {
        console.error(`Image generation failed for prompt: "${prompt}"`, err);
        return { index, imageUrl: null, revisedPrompt: null, error: err.message || 'Generation failed' };
      }
    });
    const results = await Promise.allSettled(imagePromises);
    setGeneratedImages(prevImages => prevImages.map((imgState, idx) => {
      const matchingResult = results.find(r => r.status === 'fulfilled' && r.value.index === idx);
      if (matchingResult && matchingResult.status === 'fulfilled') {
        const { imageUrl, revisedPrompt, error } = matchingResult.value;
        return { ...imgState, imageUrl, revisedPrompt, error, isLoading: false };
      }
      const failedResult = results.find(r => r.status === 'rejected' && (r.reason as any)?.index === idx) || results.find(r => (r as any).value?.index === idx && (r as any).value?.error);
      if (failedResult) {
         let errorMessage = 'Unknown error';
         if (failedResult.status === 'rejected') errorMessage = failedResult.reason?.message || 'Generation rejected';
         else if ((failedResult as any).value?.error) errorMessage = (failedResult as any).value.error;
        return { ...imgState, error: errorMessage, isLoading: false };
      }
      return { ...imgState, isLoading: false };
    }));
    setIsGeneratingImages(false);
    setVoiceoverUrls(Array(visuals.length).fill(null));
    setVoiceoverErrors(Array(visuals.length).fill(null));
  };

  const handleVoiceoverGeneration = async () => {
    if (isGeneratingImages || isGeneratingVoiceovers) {
      setVoiceoverGenWarning('Please wait for the current image or voiceover generation to finish.');
      return;
    }
    setImageGenWarning(null);
    setVoiceoverGenWarning(null);
    if (!generatedScript) return;
    const voiceovers = generatedScript.map(s => s.voiceover);
    if (voiceovers.length === 0) {
      setVoiceoverErrors(['No voiceover lines found in the script.']);
      return;
    }
    setIsGeneratingVoiceovers(true);
    setVoiceoverErrors([]);
    setVoiceoverUrls(Array(voiceovers.length).fill(null));

    // Prepare tasks for concurrency-limited pool
    const fetchTasks = voiceovers.map((text, i) => async () => {
      try {
        const response = await fetch('/api/ai/generate-voiceover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ script: text }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Voiceover generation failed');
        return { index: i, audioUrl: result.audioUrl, error: null };
      } catch (err: any) {
        return { index: i, audioUrl: null, error: err.message || 'Voiceover generation failed' };
      }
    });
    // Use the pool with concurrency 5
    const results = await promisePool(fetchTasks, 5);
    const newVoiceoverUrls: (string | null)[] = Array(voiceovers.length).fill(null);
    const newVoiceoverErrors: (string | null)[] = Array(voiceovers.length).fill(null);
    results.forEach((res) => {
      if (res && typeof res === 'object' && 'index' in res) {
        const { index, audioUrl, error } = res as any;
        newVoiceoverUrls[index] = audioUrl;
        newVoiceoverErrors[index] = error;
      }
    });
    setVoiceoverUrls(newVoiceoverUrls);
    setVoiceoverErrors(newVoiceoverErrors);
    setIsGeneratingVoiceovers(false);
  };

  const handleComposeVideo = async () => {
    if (!canCompose || !generatedScript) return;
    setIsComposingVideo(true);
    setComposeError(null);
    setComposeResult(null);
    setComposeJobId(null);
    setComposeStatus(null);
    try {
      const imageUrls = generatedImages.map(img => img.imageUrl);
      const captions = generatedScript.map(s => s.voiceover);
      const response = await fetch('/api/video/compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: imageUrls,
          captions,
          voiceoverUrls,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Video composition failed');
      if (result.videoUrl) {
        setComposeResult({ videoUrl: result.videoUrl });
        setComposeStatus('done');
      } else {
        throw new Error('Unexpected response from video compose API');
      }
    } catch (err: any) {
      setComposeError(err.message || 'Video composition failed');
      setComposeStatus('error');
    }
    setIsComposingVideo(false);
  };

  // Automatically align images and voiceovers if counts don't match
  useEffect(() => {
    const minCount = Math.min(generatedImages.length, voiceoverUrls.length);
    if (
      generatedImages.length > 0 &&
      voiceoverUrls.length > 0 &&
      generatedImages.length !== voiceoverUrls.length
    ) {
      setGeneratedImages((imgs) => imgs.slice(0, minCount));
      setVoiceoverUrls((urls) => urls.slice(0, minCount));
      setVoiceoverErrors((errs) => errs.slice(0, minCount));
      setAutoAlignNotice(true);
    } else if (generatedImages.length === voiceoverUrls.length) {
      setAutoAlignNotice(false);
    }
    // eslint-disable-next-line
  }, [generatedImages.length, voiceoverUrls.length]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8 text-slate-100">Create New AI Video</h1>
      <div className="bg-slate-800/50 shadow-xl rounded-xl p-6 md:p-8 max-w-3xl mx-auto">
        <div className="mb-6 flex space-x-2 border-b border-slate-700 pb-3 flex-wrap">
          {(Object.keys(inputTypeDisplayNames) as InputType[]).map((type) => (
            <button key={type} onClick={() => { setInputType(type); setScriptError(null); setGeneratedScript(null); setGeneratedImages([]); if (type !== 'prompt') setPrompt(''); if (type !== 'url') setUrl(''); if (type !== 'script') setDirectScript(''); }}
              className={`px-3 py-2 mb-2 sm:mb-0 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${inputType === type ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
              {inputTypeDisplayNames[type]}
            </button>
          ))}
        </div>
        <form onSubmit={handleScriptSubmit} className="space-y-6">
          {inputType === 'prompt' && (<div><label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-1">Video Topic or Prompt</label><textarea id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} placeholder="e.g., 'The future of renewable energy'..." className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 text-slate-100 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:opacity-50" disabled={isLoadingScript}/></div>)}
          {inputType === 'url' && (<div><label htmlFor="url" className="block text-sm font-medium text-slate-300 mb-1">Article or Blog Post URL</label><input type="url" id="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/..." className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 text-slate-100 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:opacity-50" disabled={isLoadingScript}/></div>)}
          {inputType === 'script' && (<div><label htmlFor="directScript" className="block text-sm font-medium text-slate-300 mb-1">Your Video Script</label><textarea id="directScript" value={directScript} onChange={(e) => setDirectScript(e.target.value)} rows={10} placeholder="Paste or write your full video script here..." className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 text-slate-100 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:opacity-50" disabled={isLoadingScript}/></div>)}
          
          {scriptError && (<div className="my-3 bg-red-500/20 border border-red-700 text-red-300 px-4 py-3 rounded text-sm">{scriptError}</div>)}
          <div><button type="submit" disabled={isLoadingScript || (inputType === 'prompt' && !prompt.trim()) || (inputType === 'url' && !url.trim()) || (inputType === 'script' && !directScript.trim())} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150">{isLoadingScript ? 'Processing Script...' : (inputType === 'prompt' ? 'Generate Script from Prompt' : (inputType === 'url' ? 'Generate Script from URL' : 'Use This Script'))}</button></div>
        </form>

        {generatedScript && (
          <div className="mt-8 pt-6 border-t border-slate-700">
            <h2 className="text-xl font-semibold text-slate-200 mb-3">Script Preview:</h2>
            <pre className="bg-slate-700/50 p-4 rounded-md text-slate-300 text-sm whitespace-pre-wrap break-words mb-6">{JSON.stringify(generatedScript)}</pre>
            
            <div className="pt-4 border-t border-slate-700/50">
              <h3 className="text-lg font-semibold text-slate-200 mb-4">Visuals for Script</h3>
              {imageGenWarning && (
                <div className="my-2 bg-yellow-500/20 border border-yellow-700 text-yellow-700 px-3 py-2 rounded text-xs">
                  <strong>Warning:</strong> {imageGenWarning}
                </div>
              )}
              <button onClick={handleImageGeneration} disabled={isGeneratingImages || isGeneratingVoiceovers || !generatedScript} className="w-full sm:w-auto flex justify-center py-2.5 px-4 mb-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150">
                {isGeneratingImages ? 'Generating All Images...' : 'Generate Images for Script Cues'}
              </button>

              {generatedImages.length > 0 && (
                <div className="space-y-6">
                  {generatedImages.map((imgData) => (
                    <div key={imgData.id} className="p-4 bg-slate-700/30 rounded-lg">
                      <p className="text-sm text-slate-400 mb-1"><strong>Original Cue:</strong> {imgData.originalPrompt}</p>
                      {imgData.isLoading && <p className="text-sm text-sky-400">Generating image...</p>}
                      {imgData.error && <div className="my-2 bg-red-500/20 border border-red-700 text-red-300 px-3 py-2 rounded text-xs"><strong>Error:</strong> {imgData.error}</div>}
                      {imgData.revisedPrompt && <p className="text-xs text-slate-400 my-1 italic">AI Revised Prompt: {imgData.revisedPrompt}</p>}
                      {imgData.imageUrl && (
                        <img src={imgData.imageUrl} alt={imgData.revisedPrompt || imgData.originalPrompt} className="rounded-lg shadow-md max-w-xs sm:max-w-sm md:max-w-md h-auto mx-auto mt-2" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Voiceover Generation Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Voiceover</h3>
              {voiceoverGenWarning && (
                <div className="my-2 bg-yellow-500/20 border border-yellow-700 text-yellow-700 px-3 py-2 rounded text-xs">
                  <strong>Warning:</strong> {voiceoverGenWarning}
                </div>
              )}
              <button
                onClick={handleVoiceoverGeneration}
                disabled={isGeneratingVoiceovers || isGeneratingImages}
                className="w-full sm:w-auto flex justify-center py-2.5 px-4 mb-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
              >
                {isGeneratingVoiceovers ? 'Generating Voiceovers...' : 'Generate Voiceovers'}
              </button>
              {filteredVoiceoverErrors.length > 0 && (
                <div className="my-2 bg-red-500/20 border border-red-700 text-red-300 px-3 py-2 rounded text-xs">
                  <strong>Errors:</strong> {filteredVoiceoverErrors.join(', ')}
                </div>
              )}
              {voiceoverUrls.length > 0 && (
                <div className="space-y-6">
                  {voiceoverUrls.map((url, index) => (
                    <div key={index} className="p-4 bg-slate-700/30 rounded-lg">
                      <p className="text-sm text-slate-400 mb-1"><strong>Voiceover {index + 1}:</strong></p>
                      {url && (
                        <audio controls src={url} className="w-full mt-2">
                          Your browser does not support the audio element.
                        </audio>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {/* Compose Final Video Button */}
              {!countsMatch && (
                <div className="my-2 bg-red-500/20 border border-red-700 text-red-300 px-3 py-2 rounded text-xs">
                  <strong>Error:</strong> The number of images ({generatedImages.length}) and voiceovers ({voiceoverUrls.length}) must match to compose the video. Please adjust your script or visual cues.
                </div>
              )}
              {canCompose && (
                <div className="mt-6">
                  <button
                    onClick={handleComposeVideo}
                    disabled={isComposingVideo || composeStatus === 'pending'}
                    className="w-full sm:w-auto flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
                  >
                    {isComposingVideo || composeStatus === 'pending' ? 'Composing Final Video...' : 'Compose Final Video'}
                  </button>
                  {composeStatus === 'pending' && (
                    <div className="my-2 bg-blue-500/20 border border-blue-700 text-blue-300 px-3 py-2 rounded text-xs">
                      <strong>Rendering video...</strong> This may take up to a few minutes. Please wait...
                    </div>
                  )}
                  {composeError && (
                    <div className="my-2 bg-red-500/20 border border-red-700 text-red-300 px-3 py-2 rounded text-xs">
                      <strong>Error:</strong> {composeError}
                    </div>
                  )}
                  {composeResult && (
                    <div className="my-2 bg-green-500/20 border border-green-700 text-green-300 px-3 py-2 rounded text-xs">
                      <strong>Success!</strong> <a href={composeResult.videoUrl} target="_blank" rel="noopener noreferrer" className="underline">Download Video</a>
                    </div>
                  )}
                </div>
              )}
              {/* Debug: If compose button is missing, show why */}
              {!canCompose && countsMatch && (
                <div className="mt-4 text-xs text-yellow-300">
                  <strong>Note:</strong> The "Compose Final Video" button will appear when all images and voiceovers are ready and valid.<br />
                  Images: {generatedImages.length}, All valid: {generatedImages.every(img => !!img.imageUrl && !img.isLoading && !img.error) ? 'yes' : 'no'}<br />
                  Voiceovers: {voiceoverUrls.length}, All valid: {voiceoverUrls.every(url => typeof url === 'string' && url.trim().length > 0) ? 'yes' : 'no'}
                </div>
              )}
              {autoAlignNotice && (
                <div className="my-2 bg-yellow-500/20 border border-yellow-700 text-yellow-700 px-3 py-2 rounded text-xs">
                  <strong>Note:</strong> Images and voiceovers were automatically aligned to match in count.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 