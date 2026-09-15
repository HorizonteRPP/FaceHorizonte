/**
 * Image compressor utility using off-screen HTML5 Canvas.
 * Compresses camera and gallery photos to lightweight JPEG (~80-120KB)
 * so that cross-device synchronization between PC and Mobile is instantaneous
 * and never exceeds localStorage quotas or server body limits.
 */

export async function compressImage(
  source: File | string,
  maxWidth = 1200,
  maxHeight = 900,
  quality = 0.82
): Promise<string> {
  // If it's a standard web URL (Unsplash, Discord CDN, etc.), do not compress
  if (typeof source === 'string' && (source.startsWith('http://') || source.startsWith('https://'))) {
    return source;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let { width, height } = img;

      // Scale down proportionally
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          maxHeight = height;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        // Fallback to original
        resolve(typeof source === 'string' ? source : '');
        return;
      }

      // Smooth rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Export as optimized JPEG
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      // Fallback
      resolve(typeof source === 'string' ? source : '');
    };

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        resolve('');
      };
      reader.readAsDataURL(source);
    }
  });
}
