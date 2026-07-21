/**
 * Utility for client-side file size validation and image compression
 */

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit (strictly blocks 2GB files)

/**
 * Validates file size and compresses images using Canvas if applicable
 * @param {File} file 
 * @param {object} [options]
 * @param {number} [options.maxSizeBytes] Default 10MB
 * @param {number} [options.maxWidth] Max image dimension in px (default 1200)
 * @param {number} [options.maxHeight] Max image dimension in px (default 1200)
 * @param {number} [options.quality] Compression quality 0.0 - 1.0 (default 0.75)
 * @returns {Promise<File>} Compressed image or original validated file
 */
export async function processAndCompressFile(file, options = {}) {
  if (!file) return null;

  const maxSizeBytes = options.maxSizeBytes || MAX_FILE_SIZE_BYTES;
  const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);

  // 1. Strict File Size Validation (Prevents 2GB or huge file uploads immediately)
  if (file.size > maxSizeBytes) {
    const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const fileSizeGb = (file.size / (1024 * 1024 * 1024)).toFixed(2);
    const sizeDisplay = file.size >= 1024 * 1024 * 1024 ? `${fileSizeGb} جيجابايت` : `${fileSizeMb} ميجابايت`;
    throw new Error(`حجم الملف كبير جداً (${sizeDisplay}). الحد الأقصى المسموح به لرفع الملفات هو ${maxMb} ميجابايت فقط.`);
  }

  // If file is not an image (e.g. PDF, DOCX), return validated original file
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // 2. Image Compression using HTML5 Canvas
  const maxWidth = options.maxWidth || 1200;
  const maxHeight = options.maxHeight || 1200;
  const quality = options.quality || 0.75;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate scaling ratio
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file); // Fallback if compression fails
              return;
            }
            const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
            const compressedFile = new File([blob], newName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}
