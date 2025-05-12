import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // Rachel
const DEFAULT_MODEL_ID = process.env.ELEVENLABS_MODEL_ID || 'eleven_monolingual_v1';
const DEFAULT_LANGUAGE = process.env.ELEVENLABS_LANGUAGE || 'en';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!ELEVENLABS_API_KEY) {
    return NextResponse.json({ error: 'ElevenLabs API key not configured.' }, { status: 500 });
  }

  try {
    const { script, voiceId, modelId, language } = await request.json();
    if (!script || typeof script !== 'string' || script.trim().length === 0) {
      return NextResponse.json({ error: 'Script is required.' }, { status: 400 });
    }
    const selectedVoiceId = voiceId || DEFAULT_VOICE_ID;
    const selectedModelId = modelId || DEFAULT_MODEL_ID;
    const selectedLanguage = language || DEFAULT_LANGUAGE;

    const ttsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`;
    const body = {
      text: script,
      model_id: selectedModelId,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.7
      },
      ...(selectedLanguage ? { language_id: selectedLanguage } : {})
    };

    const response = await fetch(ttsUrl, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `ElevenLabs API error: ${errorText}` }, { status: 500 });
    }

    // Get the audio as a buffer
    const audioBuffer = Buffer.from(await response.arrayBuffer());
    // Convert to base64 for direct playback (or store and return a URL in production)
    const audioBase64 = audioBuffer.toString('base64');
    const audioMime = 'audio/mpeg';
    const audioDataUrl = `data:${audioMime};base64,${audioBase64}`;

    return NextResponse.json({ audioUrl: audioDataUrl }, { status: 200 });
  } catch (error: any) {
    console.error('ElevenLabs TTS API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate voiceover.' }, { status: 500 });
  }
} 