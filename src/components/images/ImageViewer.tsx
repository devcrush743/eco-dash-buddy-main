import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Camera, 
  MapPin, 
  Calendar, 
  Eye, 
  Download, 
  AlertTriangle,
  Clock,
  User,
  ZoomIn
} from 'lucide-react';
import { getImageForViewing, getReportImages } from '@/utils/imageUtils';
import { formatCoordinates } from '@/utils/geoUtils';
import { formatDistanceToNow } from 'date-fns';
import type { StoredImage } from '@/utils/imageStorage';

interface ImageViewerProps {
  reportId: string;
  reportStatus?: string;
  reportPriority?: string;
  className?: string;
}

export const ImageViewer = ({ 
  reportId, 
  reportStatus = 'open',
  reportPriority = 'normal',
  className 
}: ImageViewerProps) => {
  const [images, setImages] = useState<StoredImage[]>([]);
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<StoredImage | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  // Load images for the report
  useEffect(() => {
    const loadImages = async () => {
      setIsLoading(true);
      try {
        const reportImages = await getReportImages(reportId);
        setImages(reportImages);

        // Generate URLs for all images
        const urlMap = new Map<string, string>();
        for (const image of reportImages) {
          const url = await getImageForViewing(image.id);
          if (url) {
            urlMap.set(image.id, url);
          }
        }
        setImageUrls(urlMap);
      } catch (error) {
        console.error('Error loading report images:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (reportId) {
      loadImages();
    }

    // Cleanup URLs on unmount
    return () => {
      imageUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [reportId]);

  // Handle image selection for full view
  const handleImageSelect = async (image: StoredImage) => {
    setSelectedImage(image);
    const url = imageUrls.get(image.id);
    setSelectedImageUrl(url || null);
  };

  // Download image
  const handleDownload = (image: StoredImage) => {
    const url = imageUrls.get(image.id);
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = image.fileName || 'report-image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStatusColor = (status: string, priority: string) => {
    if (priority === 'redflag') return 'bg-red-600';
    switch (status) {
      case 'open': return 'bg-blue-500';
      case 'assigned': return 'bg-yellow-500';
      case 'collected': return 'bg-orange-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center justify-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground ml-3">Loading images...</p>
        </div>
      </Card>
    );
  }

  if (images.length === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <Camera className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-700">Photo Not Available</p>
            <p className="text-xs text-muted-foreground">
              Citizen uploaded a photo, but it's stored locally on their device. In production, photos would be stored in cloud storage for shared access.
            </p>
            <Badge variant="outline" className="mt-2 text-xs border-amber-200 text-amber-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Local Storage Limitation
            </Badge>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Images Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => {
          const imageUrl = imageUrls.get(image.id);
          return (
            <Card key={image.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="relative">
                {imageUrl ? (
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt={image.fileName}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    
                    {/* Image overlay info */}
                    <div className="absolute top-2 left-2 right-2 flex justify-between">
                      <Badge 
                        className={`${getStatusColor(reportStatus, reportPriority)} text-white text-xs`}
                      >
                        {reportPriority === 'redflag' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {reportStatus.toUpperCase()}
                      </Badge>
                      
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-7 w-7 p-0 bg-white/20 backdrop-blur-sm hover:bg-white/30"
                          onClick={() => handleImageSelect(image)}
                        >
                          <ZoomIn className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-7 w-7 p-0 bg-white/20 backdrop-blur-sm hover:bg-white/30"
                          onClick={() => handleDownload(image)}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Bottom overlay with metadata */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <div className="text-white space-y-1">
                        <div className="flex items-center gap-1 text-xs">
                          <MapPin className="h-3 w-3" />
                          <span className="font-mono">
                            {formatCoordinates(image.geoTag.latitude, image.geoTag.longitude, 3)}
                          </span>
                          {image.geoTag.accuracy && (
                            <span className="opacity-75">±{Math.round(image.geoTag.accuracy)}m</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(new Date(image.geoTag.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-48 bg-muted flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Camera className="h-8 w-8 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">Image unavailable</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Image details */}
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{image.fileName}</p>
                  <Badge variant="outline" className="text-xs">
                    {(image.fileSize / 1024 / 1024).toFixed(1)} MB
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(image.metadata.uploadedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>Citizen</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Full Size Image Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Photo Evidence - {selectedImage?.fileName}
            </DialogTitle>
          </DialogHeader>
          
          {selectedImage && selectedImageUrl && (
            <div className="space-y-4">
              {/* Full size image */}
              <div className="relative max-h-[60vh] overflow-hidden rounded-lg">
                <img
                  src={selectedImageUrl}
                  alt={selectedImage.fileName}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Image metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Image Details</h4>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>File Name:</span>
                      <span className="font-mono">{selectedImage.fileName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>File Size:</span>
                      <span>{(selectedImage.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uploaded:</span>
                      <span>{new Date(selectedImage.metadata.uploadedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Location Data</h4>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Coordinates:</span>
                      <span className="font-mono">
                        {formatCoordinates(selectedImage.geoTag.latitude, selectedImage.geoTag.longitude, 5)}
                      </span>
                    </div>
                    {selectedImage.geoTag.accuracy && (
                      <div className="flex justify-between">
                        <span>GPS Accuracy:</span>
                        <span>±{Math.round(selectedImage.geoTag.accuracy)} meters</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Timestamp:</span>
                      <span>{new Date(selectedImage.geoTag.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleDownload(selectedImage)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button onClick={() => setSelectedImage(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
