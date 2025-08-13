/**
 * Image support utilities for VizHub Runtime
 * Handles detection, MIME type resolution, and data URL conversion for image files
 */

export const IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg", 
  ".png",
  ".gif",
  ".svg",
  ".webp",
  ".bmp"
] as const;

/**
 * Checks if a filename represents an image file based on its extension
 */
export const isImageFile = (filename: string): boolean => {
  const extension = filename.toLowerCase().split('.').pop();
  if (!extension) return false;
  return IMAGE_EXTENSIONS.includes(`.${extension}` as any);
};

/**
 * Gets the appropriate MIME type for an image file based on its extension
 */
export const getImageMimeType = (filename: string): string => {
  const extension = filename.toLowerCase().split('.').pop();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    case 'webp':
      return 'image/webp';
    case 'bmp':
      return 'image/bmp';
    default:
      return 'image/png'; // fallback
  }
};

/**
 * Simple check to determine if content appears to be base64 encoded
 */
const isBase64Encoded = (content: string): boolean => {
  // Remove whitespace and check if it matches base64 pattern
  const cleaned = content.replace(/\s/g, '');
  // Base64 regex pattern - allow empty content as base64
  return /^[A-Za-z0-9+/]*={0,2}$/.test(cleaned);
};

/**
 * Converts image file content to a data URL for use in HTML/CSS
 */
export const convertImageToDataURL = (filename: string, content: string): string => {
  const mimeType = getImageMimeType(filename);
  const extension = filename.toLowerCase().split('.').pop();
  
  // Handle SVG files that might not be base64 encoded
  if (extension === 'svg' && !isBase64Encoded(content)) {
    return `data:${mimeType};utf8,${encodeURIComponent(content)}`;
  }
  
  // For all other images, assume base64 encoding
  return `data:${mimeType};base64,${content}`;
};

/**
 * Processes HTML content by replacing image src attributes with data URLs
 * when the corresponding image files are available in the file collection
 */
export const processHTMLImages = (html: string, files: Record<string, string>): string => {
  // Match img tags and capture the src attribute value
  return html.replace(
    /<img([^>]*)\s+src=["']([^"']+)["']([^>]*)>/gi,
    (match, beforeSrc, src, afterSrc) => {
      // Check if the src references a file in our collection and is an image
      if (files[src] !== undefined && isImageFile(src)) {
        const dataURL = convertImageToDataURL(src, files[src]);
        return `<img${beforeSrc} src="${dataURL}"${afterSrc}>`;
      }
      return match;
    }
  );
};