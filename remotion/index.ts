import React from 'react'; // Import React
import { registerRoot } from 'remotion';
import { VideoComposition } from './VideoComposition';
import { Composition, calculateMetadata } from 'remotion';
import { z } from 'zod';
import { VideoInputProps } from './VideoComposition'; // Assuming VideoInputProps is exported from here

// Define Zod schema matching VideoInputProps
// Ensure this matches the interface in VideoComposition.tsx exactly
const videoInputPropsSchema = z.object({
  images: z.array(z.string().url({ message: "Image must be a valid URL" })),
  captions: z.array(z.string()),
  voiceoverUrls: z.array(z.string().url({ message: "Voiceover must be a valid URL" })),
  durationsInFrames: z.array(z.number().int().gte(1, { message: "Duration must be at least 1 frame" })),
});

// Type alias for clarity
type VideoInputPropsSchema = z.infer<typeof videoInputPropsSchema>;

// Type assertion helper for props within calculateMetadata
// Note: calculateMetadata receives props as 'unknown'
const parseInputProps = (props: unknown): VideoInputProps => {
  // Use safeParse to handle potential errors gracefully
  const result = videoInputPropsSchema.safeParse(props);
  if (!result.success) {
    console.error("Zod validation failed:", result.error.format());
    // Throw an error or return default props if validation fails
    // Throwing ensures the render fails clearly if props are bad
    throw new Error("Invalid input props provided.");
  }
  return result.data;
};

// --- Configuration ---
const COMPOSITION_ID = "Video"; // Must match ID used in API route
const FPS = 30; // Must match FPS used in API route
const WIDTH = 1920;
const HEIGHT = 1080;

// --- Default Props for Remotion Studio ---
const defaultPropsForStudio: VideoInputPropsSchema = {
  images: [
    'https://via.placeholder.com/1920x1080/FFA500/000000?text=Default+Image+1',
    'https://via.placeholder.com/1920x1080/ADD8E6/000000?text=Default+Image+2'
  ],
  captions: ['Default Caption 1: Edit Props!', 'Default Caption 2'],
  voiceoverUrls: [
    'https://download.samplelib.com/mp3/sample-3s.mp3',
    'https://download.samplelib.com/mp3/sample-6s.mp3'
  ],
  durationsInFrames: [FPS * 3, FPS * 6], // Example: 3s, 6s
};

// --- Root Component Definition ---
const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id={COMPOSITION_ID}
        component={VideoComposition}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        schema={videoInputPropsSchema}
        defaultProps={defaultPropsForStudio}
        // --- Dynamic Duration Calculation ---
        calculateMetadata={async ({ props }) => {
          try {
            // Validate incoming props using Zod
            const safeProps = videoInputPropsSchema.parse(props);
            // Calculate total duration
            const totalDuration = safeProps.durationsInFrames.reduce((sum, d) => sum + d, 0);
            if (totalDuration < 1) {
                throw new Error("Calculated total duration is less than 1 frame.")
            }
            return {
              durationInFrames: totalDuration,
              props: safeProps, // Pass validated props
            };
          } catch (error) {
            console.error('Error calculating metadata:', error instanceof z.ZodError ? error.format() : error);
            // Fallback on error
            return {
              durationInFrames: 1,
              props: defaultPropsForStudio, // Use defaults
            };
          }
        }}
      />
    </>
  );
};

// --- Register Root Component ---
registerRoot(RemotionRoot); 