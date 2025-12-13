import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getYoutubeVideoId(url) {
  if (!url) return null;
  let videoId = null;
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?(?:m\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      videoId = match[1];
      break;
    }
  }
  return videoId;
}

export function getYoutubeEmbedUrl(url) {
  const videoId = getYoutubeVideoId(url);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  // Return original url if it's not a youtube link, or if it's already an embed link (that doesn't need cleaning)
  // A more robust solution could validate other embeddable video sources.
  return url;
}
