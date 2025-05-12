import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import OpenAI from 'openai';
// We might need a library to parse HTML content if response is not plain text.
// For now, we'll assume we can get some usable text or try a very basic extraction.

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function fetchUrlContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        // Some sites might require a User-Agent
        'User-Agent': 'SociAI-Reels-Bot/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7'
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    const contentType = response.headers.get('content-type');
    let textContent = '';

    if (contentType && (contentType.includes('text/html') || contentType.includes('application/xhtml+xml'))) {
      const html = await response.text();
      // Very naive text extraction: strip HTML tags. 
      // For robust extraction, a library like Cheerio would be better.
      textContent = html.replace(/<[^>]+>/g, ' ').replace(/\s\s+/g, ' ').trim();
      // A more advanced approach would be to use a headless browser or a dedicated readability library.
    } else if (contentType && contentType.includes('text/plain')) {
      textContent = await response.text();
    } else {
      // Attempt to get text anyway, or handle as unsupported
      console.warn(`Unsupported content type: ${contentType} for URL: ${url}. Attempting to read as text.`);
      textContent = await response.text(); 
      // If it's binary or something else, this might not be useful.
    }
    return textContent.substring(0, 15000); // Limit content length to avoid excessive OpenAI costs/processing
  } catch (error) {
    console.error(`Error fetching URL content for ${url}:`, error);
    throw new Error(`Could not retrieve content from URL: ${url}.`);
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required.' }, { status: 400 });
    }
    // Basic URL validation
    try {
      new URL(url);
    } catch (_) {
      return NextResponse.json({ error: 'Invalid URL format.' }, { status: 400 });
    }

    const articleContent = await fetchUrlContent(url);

    if (!articleContent.trim()) {
        return NextResponse.json({ error: 'Could not extract meaningful content from the URL.' }, { status: 400 });
    }

    const systemMessage = `You are an AI assistant that creates video script outlines from articles or web page content.
Your goal is to summarize the provided text content and structure it into a concise, engaging script for a short social media video.
The script should be broken down into clear scenes or segments.
For each scene, suggest:
1. A brief description of the visual content or on-screen action relevant to the text.
2. The voiceover or on-screen text for that segment, derived from the article content.
Focus on extracting the main points, key arguments, or narrative from the text.
Keep the total script length suitable for a short video (e.g., 30-90 seconds reading time).
Highlight the most engaging parts of the article. Include a hook, 2-3 main points, and a conclusion or call to action if the source material suggests one.`;

    const chatCompletion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: `Please create a video script outline from the following article content:\n\n${articleContent}` },
      ],
      model: 'gpt-3.5-turbo', 
      temperature: 0.6,
      max_tokens: 600, 
    });

    const script = chatCompletion.choices[0]?.message?.content;

    if (!script) {
      return NextResponse.json({ error: 'Failed to generate script from URL content via AI.' }, { status: 500 });
    }

    return NextResponse.json({ script: script.trim() }, { status: 200 });

  } catch (error: any) {
    console.error('AI URL Processing API Error:', error);
    let errorMessage = 'Failed to process URL and generate script.';
    if (error.message.startsWith('Could not retrieve content')) {
        errorMessage = error.message; // Pass through fetchUrlContent specific errors
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 