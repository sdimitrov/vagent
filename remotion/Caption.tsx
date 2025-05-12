import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// Simple word wrapping (similar to previous FFmpeg helper)
function wrapText(text: string, maxLen: number = 40): string {
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
  return lines.join('\n');
}

interface CaptionProps {
  text: string;
}

export const Caption: React.FC<CaptionProps> = ({ text }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  // Optional: Add subtle fade-in/out if desired
  const opacity = interpolate(frame, [0, fps * 0.5, fps * 1.5], [0, 1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const wrappedText = wrapText(text);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end', // Position towards bottom
        alignItems: 'center',
        paddingBottom: '15%', // Adjust as needed, lower than ffmpeg y=h-250
      }}
    >
      <div
        style={{
          opacity,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          borderRadius: '10px',
          padding: '15px 25px',
          maxWidth: '90%',
        }}
      >
        <p
          style={{
            color: 'white',
            fontSize: '48px',
            textAlign: 'center',
            margin: 0,
            lineHeight: '1.3', // Adjust line spacing
            whiteSpace: 'pre-wrap', // Respect newlines from wrapText
            fontFamily: 'Arial, Helvetica, sans-serif', // Use common fonts
          }}
        >
          {wrappedText}
        </p>
      </div>
    </AbsoluteFill>
  );
}; 