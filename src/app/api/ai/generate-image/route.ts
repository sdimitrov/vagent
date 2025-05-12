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
      return NextResponse.json({ error: 'Image prompt is required and must be a non-empty string.' }, { status: 400 });
    }

    // For DALL·E 3, it's recommended to generate 1 image at a time for best quality.
    // DALL·E 2 can generate multiple images (n > 1).
    // Let's use DALL·E 3 for higher quality by default.
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3', // Can also use 'dall-e-2' for potentially faster/cheaper generation or multiple variants
      prompt: prompt,
      n: 1, // Number of images to generate
      size: '1024x1792', // Changed to portrait aspect ratio for YouTube Shorts
      response_format: 'url', // Get a temporary URL for the image
      // quality: 'standard', // DALL·E 3 default is 'standard'. 'hd' is available for more detail but higher cost.
      // style: 'vivid', // DALL·E 3 default. Can also be 'natural'.
    });

    // Ensure data array exists and has at least one item
    const firstImageData = imageResponse.data && imageResponse.data.length > 0 ? imageResponse.data[0] : null;
    const imageUrl = firstImageData?.url;
    const revisedPrompt = firstImageData?.revised_prompt;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Failed to generate image or extract URL from AI response.' }, { status: 500 });
    }

    // OpenAI image URLs expire after an hour. For persistent storage,
    // you would need to download the image and store it (e.g., in S3, Cloudinary, etc.)
    // and then return your own stored image URL.
    // For now, we'll return the temporary OpenAI URL.

    return NextResponse.json({ imageUrl: imageUrl, revisedPrompt: revisedPrompt }, { status: 200 });

  } catch (error: any) {
    console.error('AI Image Generation API Error:', error);
    let errorMessage = 'Failed to generate image.';
    if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
    } else if (error.message) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 