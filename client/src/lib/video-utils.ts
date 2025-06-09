export function convertGoogleDriveUrl(url: string): string {
  // Check if it's a Google Drive URL
  const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    const fileId = driveMatch[1];
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  
  // If it's already a preview URL, return as is
  if (url.includes('drive.google.com') && url.includes('/preview')) {
    return url;
  }
  
  // For other URLs (YouTube, direct video files, etc.), return as is
  return url;
}

export function getVideoType(url: string): 'drive' | 'youtube' | 'direct' {
  if (url.includes('drive.google.com')) {
    return 'drive';
  }
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  return 'direct';
}

export function convertYouTubeUrl(url: string): string {
  // Convert YouTube watch URLs to embed URLs
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
}

export function convertGoogleDriveDownloadUrl(url: string): string {
  // Convert Google Drive sharing URLs to direct download URLs
  if (!url) return '';
  
  // Handle folder URLs - keep as is for folder access
  if (url.includes('/folders/')) {
    return url;
  }
  
  // Handle file URLs - convert to direct download
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    const fileId = fileMatch[1];
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  
  // If already a download URL, return as is
  if (url.includes('drive.google.com/uc?export=download')) {
    return url;
  }
  
  return url;
}

export function getMaterialsType(url: string): 'folder' | 'file' | 'direct' {
  if (!url) return 'direct';
  
  if (url.includes('drive.google.com')) {
    if (url.includes('/folders/')) {
      return 'folder';
    }
    return 'file';
  }
  
  return 'direct';
}