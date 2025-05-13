import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';
// @ts-ignore
import ffmpeg from 'fluent-ffmpeg';

const DURATION_PER_IMAGE = 60; // 2 seconds at 30fps

async function downloadFile(url: string, dest: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download file: ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buffer);
}

// Add a helper to sanitize text for ffmpeg drawtext
function sanitizeForDrawtext(text: string) {
  // Escape colons, single quotes, and backslashes for ffmpeg drawtext
  return text.replace(/:/g, '\\:').replace(/'/g, "\\'").replace(/\\/g, '\\\\');
}

// Add a helper to wrap text at word boundaries every ~40 chars
function wrapTextForDrawtext(text: string, maxLen: number = 40) {
  const words = text.split(' ');
  let lines: string[] = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxLen) {
      lines.push(current.trim());
      current = word;
    } else {
      current += ' ' + word;
    }
  }
  if (current.trim().length > 0) lines.push(current.trim());
  return lines.join('\n'); // Use real newlines for ffmpeg
}

function getFontFile() {
  const fontPaths = [
    '/Library/Fonts/Arial.ttf',
    '/System/Library/Fonts/Supplemental/Arial.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
  ];
  for (const p of fontPaths) {
    try {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        fs.accessSync(p, fs.constants.R_OK);
        return p;
      }
    } catch (e) {
      // continue
    }
  }
  console.error('No suitable font file found. Tried:', fontPaths);
  throw new Error('No suitable font file found for caption overlay.');
}

export async function POST(request: Request) {
  try {
    const { images, captions, voiceoverUrls } = await request.json();
    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'No images provided.' }, { status: 400 });
    }
    if (!Array.isArray(captions) || captions.length === 0) {
      return NextResponse.json({ error: 'No captions provided.' }, { status: 400 });
    }
    if (!Array.isArray(voiceoverUrls) || voiceoverUrls.length !== images.length) {
      return NextResponse.json({ error: 'Voiceover URLs must be provided for each image.' }, { status: 400 });
    }

    const jobId = randomUUID();
    // Synchronous: do all work before returning
    try {
      // 1. Prepare temp dir
      const tmpDir = path.join(os.tmpdir(), `ffmpeg-job-${jobId}`);
      fs.mkdirSync(tmpDir, { recursive: true });
      // 2. Download images and voiceovers
      const segmentPaths: string[] = [];
      const fontFile = getFontFile();
      console.log('Using font file for drawtext:', fontFile);
      for (let i = 0; i < images.length; i++) {
        const imgUrl = images[i];
        const audioUrl = voiceoverUrls[i];
        const caption = captions[i] || '';
        const wrappedCaption = wrapTextForDrawtext(caption, 40);
        console.log(`Segment ${i}: wrapped caption:`, wrappedCaption);
        const imgPath = path.join(tmpDir, `img${i}.jpg`);
        const audioPath = path.join(tmpDir, `voiceover${i}.mp3`);
        const segmentPath = path.join(tmpDir, `segment${i}.mp4`);
        await downloadFile(imgUrl, imgPath);
        await downloadFile(audioUrl, audioPath);

        // Get audio duration
        const audioDuration = await new Promise<number>((resolve, reject) => {
          ffmpeg.ffprobe(audioPath, (err: Error | null, metadata: any) => {
            if (err) {
              console.error(`ffprobe error for ${audioPath}:`, err);
              return resolve(2); // fallback 2s
            }
            const duration = metadata.format?.duration;
            console.log(`Audio duration for ${audioPath}: ${duration ?? 'Not found'}`);
            resolve(duration || 2); // Use duration or fallback to 2s
          });
        });
        console.log(`Using duration ${audioDuration} for segment ${i}`);

        // Create video segment with image, audio, and caption
        await new Promise<void>((resolve, reject) => {
          // Escape backslashes and single quotes for ffmpeg textfile content
          const safeCaption = wrappedCaption
            .replace(/\\/g, "\\\\") // Escape backslashes (\ -> \\)
            .replace(/'/g, "\\'");      // Escape single quotes (' -> \')
          // Write caption to a temp file to handle newlines robustly
          const captionFilePath = path.join(tmpDir, `caption${i}.txt`);
          fs.writeFileSync(captionFilePath, safeCaption); // Write the escaped caption

          const fps = 60;
          const zoompanDurationFrames = Math.ceil(fps * audioDuration);

          // Add scale filter before zoompan as a workaround for jitter
          const scaleFilter = {
            filter: 'scale',
            options: '1024:1792',
            inputs: '0:v',
            outputs: 'scaled'
          };

          // Define zoompan filter for Ken Burns effect
          const zoompanFilter = {
            filter: 'zoompan',
            options: {
              z: 'min(zoom+0.001,1.2)', // Zoom in slowly up to 1.2x
              d: zoompanDurationFrames,  // Duration of the effect in frames
              s: '1024x1792',          // Output size
              fps: fps                 // Frame rate
            },
            inputs: 'scaled',  // Takes input from the preceding scale filter
            outputs: 'zoomed' // Outputs the zoomed/panned video stream
          };

          // Use complexFilter for multi-input and drawtext+scale
          const drawtextFilter = {
            filter: 'drawtext',
            options: {
              fontfile: fontFile,
              textfile: captionFilePath, // Use textfile instead of text
              fontsize: 48,
              fontcolor: 'white',
              x: '(w-text_w)/2',
              y: 'h-250',
              box: 1,
              boxcolor: 'black@0.5',
              boxborderw: 10
            },
            inputs: 'zoomed', // Takes input from zoompan filter
            outputs: 'drawn'
          };

          const finalVideoProcessing = { // <--- ADDED: For resetting PTS
            filter: 'setpts',
            options: 'PTS-STARTPTS',
            inputs: 'drawn',
            outputs: 'finalvideo'
          };

          console.log('drawtextFilter using textfile:', drawtextFilter.options.textfile);
          const command = ffmpeg()
            .addInput(imgPath)
            .inputOptions([`-r ${fps}`])
            .loop(audioDuration)
            .addInput(audioPath)
            .complexFilter([
              scaleFilter,   // Apply scale first
              zoompanFilter, // Then zoompan
              drawtextFilter, // Then draw text on the zoomed video
              finalVideoProcessing // <--- ADDED: Reset PTS
            ])
            .outputOptions('-map', '[finalvideo]', '-map', '1:a', '-shortest') // <--- MODIFIED: Map from finalvideo
            .fps(fps) // Set the output frame rate
            .videoCodec('libx264')
            .audioCodec('aac')
            .on('start', (cmdLine: string) => {
              console.log('Spawned FFmpeg with command:', cmdLine);
            })
            .on('stderr', (stderrLine: string) => {
              console.log('FFmpeg stderr:', stderrLine);
            })
            .on('error', (err: Error) => {
              reject(err);
            })
            .on('end', () => resolve())
            .save(segmentPath);
        });
        segmentPaths.push(segmentPath);
      }
      // 3. Concatenate segments
      const concatListPath = path.join(tmpDir, 'concat.txt');
      fs.writeFileSync(
        concatListPath,
        segmentPaths.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join('\n')
      );
      const outputDir = path.join(process.cwd(), 'public', 'videos');
      fs.mkdirSync(outputDir, { recursive: true });
      const outputPath = path.join(outputDir, `${jobId}.mp4`);
      await new Promise<void>((resolve, reject) => {
        ffmpeg()
          .input(concatListPath)
          .inputOptions(['-f', 'concat', '-safe', '0'])
          .outputOptions(['-c', 'copy'])
          .on('error', (err: Error) => reject(err))
          .on('end', () => resolve())
          .save(outputPath);
      });
      return NextResponse.json({ videoUrl: `/videos/${jobId}.mp4` }, { status: 200 });
    } catch (err: any) {
      return NextResponse.json({ error: err.message || 'ffmpeg render failed' }, { status: 500 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to compose video.' }, { status: 500 });
  }
} 