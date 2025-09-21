import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Camera, 
  MapPin, 
  Loader2, 
  AlertTriangle,
  CheckCircle,
  Upload,
  X
} from 'lucide-react';
import { getCurrentLocation, uploadGeotaggedImage, createImagePreview, cleanupImagePreview } from '@/utils/imageUtils';
import { validateCoordinates, formatCoordinates } from '@/utils/geoUtils';
import { LocationPicker } from '@/components/maps/LocationPicker';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface ReportFormData {
  description: string;
  priority: 'normal' | 'redflag';
  coords: { lat: number; lng: number } | null;
  imageFile: File | null;
}

interface CitizenReportFormProps {
  onSuccess?: () => void;
  className?: string;
  onShowSteps?: () => void;
}

export const CitizenReportForm = ({ onSuccess, className, onShowSteps }: CitizenReportFormProps) => {
  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<ReportFormData>({
    description: '',
    priority: 'normal',
    coords: null,
    imageFile: null
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    // Clean up previous preview
    if (imagePreviewUrl) {
      cleanupImagePreview(imagePreviewUrl);
    }

    // Set new image and create preview
    setFormData(prev => ({ ...prev, imageFile: file }));
    const previewUrl = createImagePreview(file);
    setImagePreviewUrl(previewUrl);

    toast({
      title: "Image Selected",
      description: `${file.name} ready for upload`,
    });
  };

  // Remove image
  const handleRemoveImage = () => {
    if (imagePreviewUrl) {
      cleanupImagePreview(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
    setFormData(prev => ({ ...prev, imageFile: null }));
  };

  // Get current location
  const handleGetLocation = async () => {
    setIsGettingLocation(true);
    try {
      const position = await getCurrentLocation();
      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      if (validateCoordinates(coords.lat, coords.lng)) {
        setFormData(prev => ({ ...prev, coords }));
        toast({
          title: "Location captured",
          description: `📍 ${formatCoordinates(coords.lat, coords.lng)}`,
        });
      } else {
        throw new Error('Invalid coordinates received');
      }
    } catch (error: any) {
      console.error('Location error:', error);
      toast({
        title: "Location access failed",
        description: error.message || "Please enable location services and try again",
        variant: "destructive",
      });
    } finally {
      setIsGettingLocation(false);
    }
  };


  // Submit report
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !userProfile) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit a report",
        variant: "destructive",
      });
      return;
    }

    // Validation
    if (!formData.description.trim()) {
      toast({
        title: "Description required",
        description: "Please describe the waste management issue",
        variant: "destructive",
      });
      return;
    }

    if (!formData.coords) {
      toast({
        title: "Location required",
        description: "Please capture your current location",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload image first if provided
      let imageId: string | null = null;
      if (formData.imageFile) {
        setIsUploadingImage(true);
        try {
          const tempReportId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const imageResult = await uploadGeotaggedImage(
            formData.imageFile,
            tempReportId,
            currentUser.uid,
            formData.coords || undefined
          );
          imageId = imageResult.imageId;
          console.log('📸 Image uploaded successfully:', imageId);
        } catch (imageError) {
          console.error('Error uploading image:', imageError);
          toast({
            title: "Image Upload Failed",
            description: "Report will be submitted without image. You can add photos later.",
            variant: "destructive",
          });
        } finally {
          setIsUploadingImage(false);
        }
      }

      // Create report document in Firestore
      const reportData = {
        description: formData.description.trim(),
        reporterId: currentUser.uid,
        coords: formData.coords,
        reportedAt: serverTimestamp(),
        status: 'open',
        priority: formData.priority,
        ...(imageId && { 
          imageId, 
          hasImage: true,
          imageStoredLocally: true // Flag to indicate image is in IndexedDB
        })
      };

      const docRef = await addDoc(collection(db, 'reports'), reportData);
      
      // Log successful creation
      if (imageId) {
        console.log(`📝 Report ${docRef.id} created with image ${imageId}`);
      }

      // Update user stats (optional, don't fail if user doc doesn't exist)
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          'stats.reportsSubmitted': (userProfile.stats?.reportsSubmitted || 0) + 1,
          points: (userProfile.points || 0) + (formData.priority === 'redflag' ? 50 : 25)
        });
      } catch (statsError) {
        console.warn('Could not update user stats:', statsError);
        // Don't fail the entire operation if stats update fails
      }

      // Success!
      toast({
        title: "Report submitted successfully!",
        description: "Thank you for helping keep our community clean",
      });

      // Reset form
      if (imagePreviewUrl) {
        cleanupImagePreview(imagePreviewUrl);
        setImagePreviewUrl(null);
      }
      setFormData({
        description: '',
        priority: 'normal',
        coords: null,
        imageFile: null
      });
      onSuccess?.();

    } catch (error: any) {
      console.error('Report submission error:', error);
      toast({
        title: "Submission failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={`p-6 space-y-6 shadow-depth hover:shadow-premium transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-hero text-primary-foreground shadow-glow">
            <Camera className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-foreground tracking-tight">
              Report an Issue
            </h2>
            <p className="text-sm text-muted-foreground">
              Help keep your community clean
            </p>
          </div>
        </div>
        
        {onShowSteps && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onShowSteps}
            className="text-xs px-3 py-2"
          >
            📋 Help
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-semibold">
            Issue Description *
          </Label>
          <Textarea
            id="description"
            placeholder="Describe the waste management issue in detail..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="min-h-[100px] border-0 shadow-inner bg-background/50 rounded-xl p-4 resize-none focus:ring-2 focus:ring-primary/20"
            disabled={isSubmitting}
          />
        </div>

        {/* Priority Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Priority Level</Label>
          <div className="flex gap-3">
            <Button
              type="button"
              variant={formData.priority === 'normal' ? 'default' : 'outline'}
              onClick={() => setFormData(prev => ({ ...prev, priority: 'normal' }))}
              className="flex-1 h-12 rounded-xl"
              disabled={isSubmitting}
            >
              Normal Issue
            </Button>
            <Button
              type="button"
              variant={formData.priority === 'redflag' ? 'destructive' : 'outline'}
              onClick={() => setFormData(prev => ({ ...prev, priority: 'redflag' }))}
              className="flex-1 h-12 rounded-xl"
              disabled={isSubmitting}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Urgent
            </Button>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Location *</Label>
          
          {!showLocationPicker ? (
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGetLocation}
                  disabled={isGettingLocation || isSubmitting}
                  className="flex-1 h-12 rounded-xl border-2 border-dashed hover:border-primary"
                >
                  {isGettingLocation ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4 mr-2" />
                  )}
                  {formData.coords ? 'Update GPS Location' : 'Get Current Location'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowLocationPicker(true)}
                  disabled={isSubmitting}
                  className="h-12 px-4 rounded-xl border-2 border-dashed hover:border-primary"
                >
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowLocationPicker(true)}
                  disabled={isSubmitting}
                  className="text-xs text-primary hover:text-primary/80"
                >
                  Or select location on map
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <LocationPicker
                onLocationSelect={(coords) => setFormData(prev => ({ ...prev, coords }))}
                initialLocation={formData.coords}
                className="h-64"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowLocationPicker(false)}
                  className="flex-1"
                >
                  Done
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, coords: null }));
                    setShowLocationPicker(false);
                  }}
                  className="px-4"
                >
                  Clear
                </Button>
              </div>
            </div>
          )}
          
          {formData.coords && !showLocationPicker && (
            <Badge variant="secondary" className="flex items-center gap-2 p-2 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="font-mono text-xs">
                {formatCoordinates(formData.coords.lat, formData.coords.lng)}
              </span>
            </Badge>
          )}
        </div>

        {/* Image Upload */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Photo Evidence (Optional)</Label>
          
          {!formData.imageFile ? (
            <div className="border-2 border-dashed border-border hover:border-primary rounded-xl p-6 transition-colors">
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Add photo of the waste issue</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Images are automatically geotagged with location data
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                    <Button type="button" variant="outline" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Photo
                      </span>
                    </Button>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Supports JPEG, PNG, WebP • Max size: 10MB
                </p>
              </div>
            </div>
          ) : (
            <div className="relative border border-border rounded-xl overflow-hidden">
              {imagePreviewUrl && (
                <div className="relative">
                  <img
                    src={imagePreviewUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center justify-between">
                      <div className="text-white">
                        <p className="text-sm font-medium">{formData.imageFile.name}</p>
                        <p className="text-xs opacity-80">
                          {(formData.imageFile.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleRemoveImage}
                        disabled={isSubmitting}
                        className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              <div className="p-3 bg-green-50 border-t border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800 font-medium">
                    Photo ready - will be geotagged automatically
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || isUploadingImage || !formData.description.trim() || !formData.coords}
          className="w-full h-14 bg-gradient-hero text-lg font-display font-semibold rounded-xl shadow-premium hover:shadow-glow transition-all duration-300"
        >
          {isUploadingImage ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Uploading Photo...
            </>
          ) : isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Submitting Report...
            </>
          ) : (
            <>
              Submit Report
              {formData.imageFile && <Camera className="h-5 w-5 ml-2" />}
              {!formData.imageFile && <CheckCircle className="h-5 w-5 ml-2" />}
            </>
          )}
        </Button>
      </form>
    </Card>
  );
};
