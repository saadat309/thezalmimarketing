import React from 'react';
import { cn } from '@/lib/utils';

export function VideoPlayer({ video, className, ...props }) {
  if (!video) {
    return null;
  }

  const { path, video_embed_link } = video;

  if (video_embed_link) {
    return (
      <div className={cn("overflow-hidden rounded-lg aspect-video", className)}>
        <iframe
          src={video_embed_link}
          title="Video Player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full"
          {...props}
        ></iframe>
      </div>
    );
  }

  if (path) {
    return (
      <div className={cn("overflow-hidden rounded-lg aspect-video", className)}>
        <video
          controls
          src={path}
          className="w-full h-full"
          autoPlay={false}
          muted={false}
          {...props}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return null;
}
