export interface ParsedVideo {
  type: 'drive' | 'youtube' | 'direct';
  embedUrl?: string;
  directUrl?: string;
  fileId?: string;
  streamUrl?: string;
  openUrl?: string;
}

/**
 * Parses any video URL (Google Drive, YouTube, or direct MP4/WebM)
 * and returns structured embed and view metadata.
 */
export function parseVideoUrl(url?: string | null): ParsedVideo | null {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return null;
  }

  const cleanUrl = url.trim();

  // 1. YouTube check
  const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const ytMatch = cleanUrl.match(ytRegExp);
  if (ytMatch && ytMatch[2] && ytMatch[2].length === 11) {
    const videoId = ytMatch[2];
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${videoId}?enablejsapi=1${origin ? `&origin=${encodeURIComponent(origin)}` : ''}`,
      openUrl: `https://www.youtube.com/watch?v=${videoId}`
    };
  }

  // 2. Google Drive check
  // Matches:
  // - https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view
  // - https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview
  // - https://drive.google.com/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs
  // - https://drive.google.com/open?id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs
  // - https://drive.google.com/uc?id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs
  const gdDMatch = cleanUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
  const gdOpenMatch = cleanUrl.match(/[\?&]id=([a-zA-Z0-9_-]+)/);
  const isGoogleHost = cleanUrl.includes('drive.google.com') || cleanUrl.includes('docs.google.com');

  const fileId = gdDMatch ? gdDMatch[1] : (gdOpenMatch && isGoogleHost ? gdOpenMatch[1] : null);

  if (fileId) {
    return {
      type: 'drive',
      fileId,
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      streamUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
      openUrl: `https://drive.google.com/file/d/${fileId}/view`
    };
  }

  // 3. Fallback: Direct video URL (MP4, WebM, etc.)
  return {
    type: 'direct',
    directUrl: cleanUrl,
    openUrl: cleanUrl
  };
}
