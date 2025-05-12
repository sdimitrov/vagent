import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'Prompt is required and must be a non-empty string.' }, { status: 400 });
    }

    // Construct a system message to guide the AI
    const systemMessage = `You are an expert video scriptwriter for short social media videos (like YouTube Shorts, TikToks, Instagram Reels).
Your goal is to generate a concise and engaging script outline based on the user's prompt.
Return the script as a JSON array. Each element should be an object with the following fields:
- section: The section title (e.g., 'Opening Scene')
- visual: A brief description of the visual content or on-screen action
- voiceover: The voiceover or on-screen text for that segment
Do not include any extra text, only valid JSON. The script should be broken down into clear scenes or segments, suitable for a short video (30-90 seconds). Focus on a clear narrative: Hook, Main Content (2-3 key points), and a Call to Action (if appropriate). Avoid overly complex language. Make it punchy and engaging.`;

    const chatCompletion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt },
      ],
      model: 'gpt-3.5-turbo', // Or consider gpt-4 if available and budget allows for higher quality
      temperature: 0.7, // Adjust for creativity vs. determinism
      max_tokens: 500, // Adjust based on desired script length
    });

    const script = chatCompletion.choices[0]?.message?.content;

    if (!script) {
      return NextResponse.json({ error: 'Failed to generate script from AI.' }, { status: 500 });
    }

    return NextResponse.json({ script: script.trim() }, { status: 200 });

  } catch (error: any) {
    console.error('AI Script Generation API Error:', error);
    let errorMessage = 'Failed to generate script.';
    if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
    } else if (error.message) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 