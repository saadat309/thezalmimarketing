import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getYoutubeVideoId(url) {
  if (!url) return null;
  
  // If it's an iframe, extract src first
  const iframeMatch = url.match(/<iframe.*?src=["'](.*?)["']/i);
  const actualUrl = iframeMatch ? iframeMatch[1] : url;

  let videoId = null;
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?(?:m\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = actualUrl.match(pattern);
    if (match && match[1]) {
      videoId = match[1];
      break;
    }
  }
  return videoId;
}

export function getEmbedUrl(input) {
  if (!input) return null;

  // Extract src from iframe if present
  const iframeMatch = input.match(/<iframe.*?src=["'](.*?)["']/i);
  const url = iframeMatch ? iframeMatch[1] : input;

  const videoId = getYoutubeVideoId(url);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  // Return original url if it's not a youtube link, or if it's already an embed link (like Google Maps)
  return url;
}

export function getYoutubeEmbedUrl(input) {
  return getEmbedUrl(input);
}
