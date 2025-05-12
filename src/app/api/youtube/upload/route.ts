import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDb } from '@/db';
import { socialConnections } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { google, youtube_v3 } from 'googleapis'; // Import youtube_v3 for type safety
import { Readable } from 'stream'; // Import Readable for converting File to stream
import { decrypt } from '@/lib/encryption'; // Import the new decryption utility

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('videoFile') as File | null;
    const title = formData.get('title') as string | null;
    const description = formData.get('description') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const db = await getDb();
    const connection = await db.query.socialConnections.findFirst({
      where: and(eq(socialConnections.userId, userId), eq(socialConnections.platform, 'youtube')),
    });

    if (!connection || !connection.accessToken) {
      return NextResponse.json({ error: 'YouTube account not connected or access token missing.' }, { status: 400 });
    }

    const accessToken = decrypt(connection.accessToken); // Corrected: Call decrypt and remove await
    if (!accessToken) {
      return NextResponse.json({ error: 'Failed to decrypt access token. Ensure ENCRYPTION_KEY is set and token is valid.' }, { status: 500 });
    }

    // Initialize Google API client and perform upload
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    // Convert File to a Readable stream if necessary, or ensure file.stream() is correctly polyfilled/available
    // For Next.js Edge runtime, File.stream() is available. For Node.js, you might need to convert ArrayBuffer.
    const fileBuffer = await file.arrayBuffer();
    const readableFileStream = new Readable();
    readableFileStream.push(Buffer.from(fileBuffer));
    readableFileStream.push(null); // Signal EOF

    const videoResource: youtube_v3.Params$Resource$Videos$Insert["requestBody"] = {
      snippet: {
        title: title,
        description: description || '', // Ensure description is a string
        tags: ['SociAI Reels', 'GeneratedVideo'], // Optional: Add tags
        // Ensure categoryId is a valid string ID from YouTube API. '22' is 'People & Blogs'.
        categoryId: '22', 
      },
      status: {
        privacyStatus: 'private', // or 'public' or 'unlisted'
        selfDeclaredMadeForKids: false,
      },
    };
    
    console.log(`Attempting to upload video "${title}" to YouTube.`);

    const response = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: videoResource,
      media: {
        body: readableFileStream, // Pass the readable stream of the file
      },
    });

    console.log('YouTube Upload API Response:', response.data);
    return NextResponse.json({ 
      message: 'Video successfully uploaded to YouTube!', 
      videoId: response.data.id 
    }, { status: 200 });

  } catch (error: any) {
    console.error('YouTube Upload API Error:', error.message, error.stack, error.response?.data?.error);
    let errorMessage = 'Failed to upload video.';
    if (error.response?.data?.error?.message) { // Google API specific error
        errorMessage = error.response.data.error.message;
    }
    return NextResponse.json({ error: errorMessage, details: error.message }, { status: 500 });
  }
}
