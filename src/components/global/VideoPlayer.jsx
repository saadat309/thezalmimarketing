import React from 'react';

export function VideoPlayer({ video, ...props }) {
  if (!video) {
    return null;
  }

  const { path, video_embed_link } = video;

  if (video_embed_link) {
    return (
      <div className="overflow-hidden rounded-lg aspect-video">
        <iframe
          src={video_embed_link}
          title="Video Player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          {...props}
        ></iframe>
      </div>
    );
  }

  if (path) {
    return (
      <div className="overflow-hidden rounded-lg aspect-video">
        <video
          controls
          src={path}
          className="w-full h-full"
          {...props}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return null;
}
