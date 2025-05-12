import React from 'react';
import {
  AbsoluteFill,
  Img,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';
import { Caption } from './Caption';

interface SegmentProps {
  imageSrc: string;
  audioSrc: string;
  captionText: string;
  durationInFrames: number;
}

export const Segment: React.FC<SegmentProps> = ({
  imageSrc,
  audioSrc,
  captionText,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Ken Burns Effect (Zoom In)
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Keep centered during zoom - Use dynamic width/height
  // Calculate the offset needed to keep the center point stationary
  const translateX = interpolate(
    frame,
    [0, durationInFrames],
    [0, -(width * (1.2 - 1)) / 2], // End value: -(width * (endScale - startScale)) / 2
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  const translateY = interpolate(
    frame,
    [0, durationInFrames],
    [0, -(height * (1.2 - 1)) / 2], // End value: -(height * (endScale - startScale)) / 2
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      {/* Apply scale and translation transform */}
      <AbsoluteFill style={{ transform: `translateX(${translateX}px) translateY(${translateY}px) scale(${scale})` }}>
        <Img src={imageSrc} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
      </AbsoluteFill>
      <Audio src={audioSrc} />
      <Caption text={captionText} />
    </AbsoluteFill>
  );
}; 