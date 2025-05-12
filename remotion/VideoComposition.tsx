import React from 'react';
import { Series, AbsoluteFill, Sequence } from 'remotion';
import { Segment } from './Segment';

export interface VideoInputProps {
  images: string[];
  captions: string[];
  voiceoverUrls: string[];
  durationsInFrames: number[]; // We need durations passed in frames
}

export const VideoComposition: React.FC<VideoInputProps> = ({
  images,
  captions,
  voiceoverUrls,
  durationsInFrames,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Series>
        {images.map((imgSrc, index) => (
          <Series.Sequence key={imgSrc} durationInFrames={durationsInFrames[index]}>
            <Segment
              imageSrc={imgSrc}
              audioSrc={voiceoverUrls[index]}
              captionText={captions[index]}
              durationInFrames={durationsInFrames[index]}
            />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
}; 