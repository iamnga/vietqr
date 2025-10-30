/**
 * Image preprocessing utilities for improved QR code detection
 */

/**
 * Load image file into an HTMLImageElement
 */
export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Convert image to ImageData for processing
 */
export function imageToImageData(img: HTMLImageElement): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * Apply grayscale conversion to ImageData
 */
export function applyGrayscale(imageData: ImageData): ImageData {
  const data = new Uint8ClampedArray(imageData.data);

  for (let i = 0; i < data.length; i += 4) {
    // Convert RGB to grayscale using luminosity method
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = gray;     // R
    data[i + 1] = gray; // G
    data[i + 2] = gray; // B
    // Alpha channel (i + 3) remains unchanged
  }

  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Adjust contrast of ImageData
 * @param factor - Contrast factor (1.0 = no change, >1.0 = more contrast, <1.0 = less contrast)
 */
export function adjustContrast(imageData: ImageData, factor: number): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const intercept = 128 * (1 - factor);

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, data[i] * factor + intercept));     // R
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * factor + intercept)); // G
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * factor + intercept)); // B
    // Alpha channel (i + 3) remains unchanged
  }

  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Apply binary threshold to ImageData
 * @param threshold - Threshold value (0-255)
 */
export function applyThreshold(imageData: ImageData, threshold: number = 128): ImageData {
  const data = new Uint8ClampedArray(imageData.data);

  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const binary = gray >= threshold ? 255 : 0;
    data[i] = binary;     // R
    data[i + 1] = binary; // G
    data[i + 2] = binary; // B
    // Alpha channel (i + 3) remains unchanged
  }

  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Invert colors of ImageData (useful for QR codes on dark backgrounds)
 */
export function invertColors(imageData: ImageData): ImageData {
  const data = new Uint8ClampedArray(imageData.data);

  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];         // R
    data[i + 1] = 255 - data[i + 1]; // G
    data[i + 2] = 255 - data[i + 2]; // B
    // Alpha channel (i + 3) remains unchanged
  }

  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Preprocessing mode configuration
 */
export interface PreprocessMode {
  name: string;
  process: (imageData: ImageData) => ImageData;
}

/**
 * Get all preprocessing modes to try for QR detection
 */
export function getPreprocessingModes(): PreprocessMode[] {
  return [
    {
      name: 'original',
      process: (imageData) => imageData,
    },
    {
      name: 'grayscale',
      process: (imageData) => applyGrayscale(imageData),
    },
    {
      name: 'grayscale+contrast',
      process: (imageData) => adjustContrast(applyGrayscale(imageData), 1.5),
    },
    {
      name: 'grayscale+high-contrast',
      process: (imageData) => adjustContrast(applyGrayscale(imageData), 2.0),
    },
    {
      name: 'threshold',
      process: (imageData) => applyThreshold(imageData, 128),
    },
    {
      name: 'threshold-low',
      process: (imageData) => applyThreshold(imageData, 100),
    },
    {
      name: 'threshold-high',
      process: (imageData) => applyThreshold(imageData, 150),
    },
    {
      name: 'inverted',
      process: (imageData) => invertColors(imageData),
    },
    {
      name: 'inverted+grayscale',
      process: (imageData) => applyGrayscale(invertColors(imageData)),
    },
  ];
}
