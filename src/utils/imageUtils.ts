// Image stamping utilities for geo-tagging and metadata
import { imageStorage, type StoredImage } from './imageStorage';

export interface GeoStampData {
  lat: number;
  lng: number;
  timestamp: Date;
  accuracy?: number;
}

export interface GeotaggedImageResult {
  imageId: string;
  imageUrl: string;
  geoTag: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp: number;
  };
  metadata: {
    fileName: string;
    fileSize: number;
    uploadedAt: number;
  };
}

/**
 * Stamp an image with geolocation and timestamp metadata
 * Returns a new Blob with the stamped image
 */
export const stampImageWithMeta = async (
  imageFile: File,
  coords: { lat: number; lng: number },
  timestamp: Date = new Date()
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      try {
        // Clean up object URL immediately
        URL.revokeObjectURL(objectUrl);
        
        // Set canvas size to image size
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the original image
        ctx.drawImage(img, 0, 0);

        // Create stamp overlay
        const stampHeight = Math.max(60, img.height * 0.08);
        const fontSize = Math.max(12, stampHeight * 0.25);
        
        // Semi-transparent background for stamp
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, img.height - stampHeight, img.width, stampHeight);

        // Text styling
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'left';

        // Format coordinates and timestamp
        const latStr = `${coords.lat.toFixed(6)}°`;
        const lngStr = `${coords.lng.toFixed(6)}°`;
        const timeStr = timestamp.toLocaleString();
        const locationStr = `📍 ${latStr}, ${lngStr}`;

        // Draw timestamp on first line
        ctx.fillText(`🕒 ${timeStr}`, 10, img.height - stampHeight + fontSize + 5);
        
        // Draw coordinates on second line
        ctx.fillText(locationStr, 10, img.height - stampHeight + (fontSize * 2) + 10);

        // Add watermark
        ctx.font = `${fontSize * 0.8}px Arial`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.textAlign = 'right';
        ctx.fillText('Swachh Saarthi', img.width - 10, img.height - 10);

        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        }, 'image/jpeg', 0.9);

      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    // Create object URL and load image
    const objectUrl = URL.createObjectURL(imageFile);
    img.src = objectUrl;
  });
};

/**
 * Get current geolocation with options
 */
export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // Cache for 1 minute
      }
    );
  });
};

/**
 * Compress image file to reduce size
 */
export const compressImage = async (
  file: File, 
  maxWidth: number = 1920, 
  maxHeight: number = 1080, 
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to compress image'));
        }
      }, 'image/jpeg', quality);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'Image must be smaller than 10MB' };
  }

  // Check if it's a supported format
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!supportedTypes.includes(file.type)) {
    return { valid: false, error: 'Supported formats: JPEG, PNG, WebP' };
  }

  return { valid: true };
};

/**
 * Create a preview URL for an image file
 */
export const createImagePreview = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Clean up preview URL
 */
export const cleanupImagePreview = (url: string): void => {
  URL.revokeObjectURL(url);
};

/**
 * Upload geotagged image without using Firebase Storage
 * Stores image locally with geolocation data
 */
export const uploadGeotaggedImage = async (
  imageFile: File,
  reportId: string,
  userId: string,
  coords?: { lat: number; lng: number }
): Promise<GeotaggedImageResult> => {
  try {
    // Get current location if not provided
    let geoTag;
    if (coords) {
      geoTag = {
        latitude: coords.lat,
        longitude: coords.lng,
        timestamp: Date.now()
      };
    } else {
      const position = await getCurrentLocation();
      geoTag = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };
    }

    // Store image locally with geotag
    const imageId = await imageStorage.storeImage(reportId, imageFile, geoTag, userId);
    
    // Get stored image to create shareable URL
    const storedImage = await imageStorage.getImage(imageId);
    if (!storedImage) {
      throw new Error('Failed to retrieve stored image');
    }

    // Create temporary shareable URL
    const imageUrl = imageStorage.createShareableURL(storedImage.imageData);

    return {
      imageId,
      imageUrl,
      geoTag,
      metadata: {
        fileName: imageFile.name,
        fileSize: imageFile.size,
        uploadedAt: Date.now()
      }
    };
  } catch (error) {
    console.error('Error uploading geotagged image:', error);
    throw new Error('Failed to upload geotagged image');
  }
};

/**
 * Get image for viewing (creates temporary URL)
 */
export const getImageForViewing = async (imageId: string): Promise<string | null> => {
  try {
    const storedImage = await imageStorage.getImage(imageId);
    if (!storedImage || storedImage.metadata.disposed) {
      return null;
    }

    return imageStorage.createShareableURL(storedImage.imageData);
  } catch (error) {
    console.error('Error getting image for viewing:', error);
    return null;
  }
};

/**
 * Dispose image after citizen approval
 */
export const disposeImageAfterApproval = async (imageId: string): Promise<boolean> => {
  try {
    const disposed = await imageStorage.disposeImage(imageId);
    if (disposed) {
      console.log(`📸 Image ${imageId} disposed after approval`);
    }
    return disposed;
  } catch (error) {
    console.error('Error disposing image:', error);
    return false;
  }
};

/**
 * Get all images for a report (for drivers to view)
 */
export const getReportImages = async (reportId: string): Promise<StoredImage[]> => {
  try {
    return await imageStorage.getImagesByReportId(reportId);
  } catch (error) {
    console.error('Error getting report images:', error);
    return [];
  }
};

/**
 * Get storage usage statistics
 */
export const getImageStorageStats = async () => {
  return await imageStorage.getStorageStats();
};
