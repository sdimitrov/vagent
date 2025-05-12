import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs/promises";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { VideoInputProps } from "../../../remotion/VideoComposition"; // Expects separate arrays + duration in frames
import { GeneratedContent } from "@/types/video";

// Interface extending GeneratedContent to include duration
interface SegmentData extends GeneratedContent {
  durationInSeconds: number;
}

// Define the structure of the expected request body
interface RequestBody {
  script: string;
  generatedContent: GeneratedContent[];
}

const FPS = 30; // Define target Frames Per Second

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const { generatedContent }: RequestBody = req.body;

    if (!generatedContent || !Array.isArray(generatedContent) || generatedContent.length === 0) {
      return res.status(400).json({ error: "Missing or invalid generatedContent in request body" });
    }

    // --- Data Preparation for Remotion ---
    const images: string[] = [];
    const captions: string[] = [];
    const voiceoverUrls: string[] = [];
    const durationsInFrames: number[] = [];

    console.log("Calculating audio durations and preparing props...");
    for (const segment of generatedContent) {
      try {
        // --- Audio Duration Calculation ---
        // Convert public URL path to local filesystem path for duration check
        // Assumes voiceover path in segment is like "/audio/file.mp3"
        // And files are served from "public" directory
        const localVoiceoverPath = path.join(process.cwd(), "public", segment.voiceover);
        // Ensure the local file actually exists before getting duration
        try {
            await fs.access(localVoiceoverPath);
        } catch (accessError) {
            console.error(`Audio file not accessible at path derived from URL ${segment.voiceover}: ${localVoiceoverPath}`);
            throw new Error(`Audio file not found for segment: ${segment.section}`);
        }
        
        const durationInSeconds = await getAudioDurationInSeconds(localVoiceoverPath);
        const durationInFrames = Math.round(durationInSeconds * FPS);
        // ---

        if (durationInFrames <= 0) {
          console.warn(`Segment "${segment.section}" with voiceover ${segment.voiceover} has zero or negative duration (${durationInSeconds}s). Skipping.`);
          continue; // Skip segments with no duration
        }

        // --- Prepare Props for Remotion ---
        images.push(segment.visual); // Keep visual as URL
        captions.push(segment.section);
        voiceoverUrls.push(segment.voiceover); // Keep voiceover as URL for Remotion <Audio>
        durationsInFrames.push(durationInFrames);

      } catch (error) {
        console.error(`Error processing segment for ${segment.section} (${segment.voiceover}):`, error);
        throw new Error(`Failed to process segment: ${segment.section}`);
      }
    }

    if (images.length === 0) {
      return res.status(400).json({ error: "No valid segments found after processing durations." });
    }

    // --- Remotion Rendering ---
    const compositionId = "Video";
    const entry = "./remotion/index.ts";
    const outputDir = path.join(process.cwd(), "public");
    const outputLocation = path.join(outputDir, "output.mp4");

    await fs.mkdir(outputDir, { recursive: true });

    console.log("Bundling Remotion composition...");
    const bundleLocation = await bundle({ entryPoint: path.resolve(entry) });
    console.log(`Bundle created at: ${bundleLocation}`);

    // Prepare inputProps matching the VideoInputProps interface
    const inputProps: VideoInputProps = {
      images,
      captions,
      voiceoverUrls,
      durationsInFrames,
    };

    console.log("Fetching compositions...");
    const comps = await getCompositions(bundleLocation);
    console.log(`Found compositions: ${comps.map((c) => c.id).join(', ')}`);

    const composition = comps.find((c) => c.id === compositionId);
    if (!composition) {
      throw new Error(`Composition '${compositionId}' not found.`);
    }

    // Check if calculated total duration matches composition duration
    const totalCalculatedDuration = durationsInFrames.reduce((sum, d) => sum + d, 0);
    if (composition.durationInFrames !== totalCalculatedDuration) {
        console.warn(`Composition duration (${composition.durationInFrames} frames) does not match calculated total segment duration (${totalCalculatedDuration} frames). The video might be cut short or have blank space. Ensure your Remotion composition's duration is dynamic (e.g., using calculateMetadata).`);
        // It might be safer to update the composition duration if possible, 
        // but renderMedia doesn't allow overriding it directly.
        // The composition itself needs to handle dynamic duration.
    }

    console.log(`Rendering composition '${compositionId}' (${composition.width}x${composition.height}, ${composition.durationInFrames} frames)...`);
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation,
      inputProps: inputProps as any, // Cast to bypass strict type check for diagnosis
      // logLevel: "verbose",
    });

    console.log(`Video rendered successfully: ${outputLocation}`);

    // Return the path relative to the public directory for client access
    const publicPath = "/output.mp4"; 
    res.status(200).json({ videoPath: publicPath });

  } catch (error) {
    console.error("Video composition failed:", error);
    res.status(500).json({ error: "Video composition failed", details: error instanceof Error ? error.message : String(error) });
  }
} 