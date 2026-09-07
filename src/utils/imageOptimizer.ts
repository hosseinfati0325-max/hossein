/**
 * Client-side fast image optimizer and compressor.
 * Downscales raw camera/gallery images to optimal dimensions (max 1400px)
 * and converts to compressed JPEG DataURL (~150KB-350KB),
 * preventing network payload limits (413 errors) and enabling instant Gemini Vision responses.
 */
export async function optimizeImageForAi(
  fileOrDataUrl: File | string,
  maxWidth = 1400,
  maxHeight = 1400,
  quality = 0.85
): Promise<{ dataUrl: string; mimeType: string; sizeBytes: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(width, 1);
      canvas.height = Math.max(height, 1);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Fallback to original
        if (typeof fileOrDataUrl === 'string') {
          resolve({ dataUrl: fileOrDataUrl, mimeType: 'image/jpeg', sizeBytes: fileOrDataUrl.length });
        } else {
          resolve({ dataUrl: '', mimeType: 'image/jpeg', sizeBytes: 0 });
        }
        return;
      }

      // Draw with smooth scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      const approxBytes = Math.round((compressedDataUrl.length * 3) / 4);

      resolve({
        dataUrl: compressedDataUrl,
        mimeType: 'image/jpeg',
        sizeBytes: approxBytes,
      });
    };

    img.onerror = (err) => {
      console.warn('Image optimization error, using fallback', err);
      if (typeof fileOrDataUrl === 'string') {
        resolve({ dataUrl: fileOrDataUrl, mimeType: 'image/jpeg', sizeBytes: fileOrDataUrl.length });
      } else {
        reject(err);
      }
    };

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}
