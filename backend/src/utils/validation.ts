/**
 * Validation utility functions
 */

/**
 * Validates if a string is a valid UUID (v4)
 * @param id - The string to validate
 * @returns true if valid UUID, false otherwise
 */
export function validateUUID(id: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Validates if a filename has an allowed extension
 * @param filename - The filename to validate
 * @param allowedExtensions - Array of allowed extensions (e.g., ['.txt', '.pdf'])
 * @returns true if extension is allowed, false otherwise
 */
export function validateFileExtension(
  filename: string,
  allowedExtensions: string[],
): boolean {
  if (!filename) return false;
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return allowedExtensions.includes(ext);
}

/**
 * Validates if a file type (MIME type) is allowed
 * @param mimeType - The MIME type to validate
 * @param allowedMimeTypes - Array of allowed MIME types
 * @returns true if MIME type is allowed, false otherwise
 */
export function validateMimeType(
  mimeType: string,
  allowedMimeTypes: string[],
): boolean {
  if (!mimeType) return false;
  return allowedMimeTypes.includes(mimeType);
}

/**
 * Validates if a file size is within the allowed limit
 * @param fileSize - The file size in bytes
 * @param maxSize - The maximum allowed file size in bytes
 * @returns true if file size is within limit, false otherwise
 */
export function validateFileSize(fileSize: number, maxSize: number): boolean {
  return fileSize <= maxSize;
}

/**
 * Formats file size for display
 * @param bytes - The file size in bytes
 * @returns Formatted string (e.g., '1.5 MB')
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
