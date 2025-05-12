import { NextResponse } from 'next/server';
import { jobStore } from '../jobStore';

export async function POST(request: Request) {
  try {
    const { jobId } = await request.json();
    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json({ error: 'No jobId provided.' }, { status: 400 });
    }
    const job = jobStore[jobId];
    if (!job) {
      return NextResponse.json({ error: 'Job not found.' }, { status: 404 });
    }
    return NextResponse.json({ status: job.status, videoUrl: job.videoUrl, error: job.error });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to get job status.' }, { status: 500 });
  }
} 