// Client-side image storage using IndexedDB
// No Firebase Storage required - images stored locally with sharing capabilities

interface StoredImage {
  id: string;
  reportId: string;
  imageData: string; // Base64 data URL
  fileName: string;
  fileSize: number;
  geoTag: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp: number;
  };
  metadata: {
    uploadedAt: number;
    userId: string;
    disposed?: boolean;
    disposedAt?: number;
  };
}

class ImageStorageManager {
  private dbName = 'SwachhSaarthiImages';
  private dbVersion = 1;
  private storeName = 'images';

  // Initialize IndexedDB
  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('reportId', 'reportId', { unique: false });
          store.createIndex('userId', 'metadata.userId', { unique: false });
        }
      };
    });
  }

  // Store image with geotag
  async storeImage(
    reportId: string, 
    file: File, 
    geoTag: StoredImage['geoTag'],
    userId: string
  ): Promise<string> {
    try {
      // Convert file to base64
      const imageData = await this.fileToBase64(file);
      
      const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const storedImage: StoredImage = {
        id: imageId,
        reportId,
        imageData,
        fileName: file.name,
        fileSize: file.size,
        geoTag,
        metadata: {
          uploadedAt: Date.now(),
          userId,
          disposed: false
        }
      };

      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      await new Promise((resolve, reject) => {
        const request = store.add(storedImage);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      console.log(`📸 Image stored locally: ${imageId} for report ${reportId}`);
      return imageId;
    } catch (error) {
      console.error('Error storing image:', error);
      throw new Error('Failed to store image locally');
    }
  }

  // Get image by ID
  async getImage(imageId: string): Promise<StoredImage | null> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.get(imageId);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting image:', error);
      return null;
    }
  }

  // Get images for a specific report
  async getImagesByReportId(reportId: string): Promise<StoredImage[]> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('reportId');
      
      return new Promise((resolve, reject) => {
        const request = index.getAll(reportId);
        request.onsuccess = () => {
          const images = request.result.filter(img => !img.metadata.disposed);
          resolve(images);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting images by report ID:', error);
      return [];
    }
  }

  // Get images for a specific user
  async getImagesByUserId(userId: string): Promise<StoredImage[]> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('userId');
      
      return new Promise((resolve, reject) => {
        const request = index.getAll(userId);
        request.onsuccess = () => {
          const images = request.result.filter(img => !img.metadata.disposed);
          resolve(images);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting images by user ID:', error);
      return [];
    }
  }

  // Dispose image (mark as disposed, don't delete immediately)
  async disposeImage(imageId: string): Promise<boolean> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      // Get the image first
      const getRequest = store.get(imageId);
      
      return new Promise((resolve, reject) => {
        getRequest.onsuccess = () => {
          const image = getRequest.result;
          if (!image) {
            resolve(false);
            return;
          }

          // Mark as disposed
          image.metadata.disposed = true;
          image.metadata.disposedAt = Date.now();

          const putRequest = store.put(image);
          putRequest.onsuccess = () => {
            console.log(`🗑️ Image disposed: ${imageId}`);
            resolve(true);
          };
          putRequest.onerror = () => reject(putRequest.error);
        };
        getRequest.onerror = () => reject(getRequest.error);
      });
    } catch (error) {
      console.error('Error disposing image:', error);
      return false;
    }
  }

  // Clean up disposed images (run periodically)
  async cleanupDisposedImages(): Promise<number> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const allImages = request.result;
          const disposedImages = allImages.filter(
            img => img.metadata.disposed && 
            img.metadata.disposedAt && 
            (Date.now() - img.metadata.disposedAt) > 24 * 60 * 60 * 1000 // 24 hours
          );

          let deletedCount = 0;
          disposedImages.forEach(img => {
            const deleteRequest = store.delete(img.id);
            deleteRequest.onsuccess = () => deletedCount++;
          });

          resolve(deletedCount);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error cleaning up disposed images:', error);
      return 0;
    }
  }

  // Get storage usage statistics
  async getStorageStats(): Promise<{
    totalImages: number;
    totalSize: number;
    activeImages: number;
    disposedImages: number;
  }> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const images = request.result;
          const stats = {
            totalImages: images.length,
            totalSize: images.reduce((total, img) => total + img.fileSize, 0),
            activeImages: images.filter(img => !img.metadata.disposed).length,
            disposedImages: images.filter(img => img.metadata.disposed).length
          };
          resolve(stats);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return { totalImages: 0, totalSize: 0, activeImages: 0, disposedImages: 0 };
    }
  }

  // Convert file to base64
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  // Create shareable image URL (blob URL for temporary access)
  createShareableURL(imageData: string): string {
    // Convert base64 to blob
    const byteCharacters = atob(imageData.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    
    return URL.createObjectURL(blob);
  }

  // Revoke shareable URL (cleanup)
  revokeShareableURL(url: string): void {
    URL.revokeObjectURL(url);
  }
}

// Export singleton instance
export const imageStorage = new ImageStorageManager();

// Export types
export type { StoredImage };
