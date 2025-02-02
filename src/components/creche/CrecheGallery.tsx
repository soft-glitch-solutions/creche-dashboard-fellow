import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface GalleryImage {
  id: string;
  image_url: string;
  caption?: string;
  order_index?: number;
}

interface CrecheGalleryProps {
  crecheId: string;
}

export const CrecheGallery = ({ crecheId }: CrecheGalleryProps) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const loadGalleryImages = async () => {
    try {
      const { data, error } = await supabase
        .from('creche_gallery')
        .select('*')
        .eq('creche_id', crecheId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error loading gallery images:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load gallery images",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useState(() => {
    loadGalleryImages();
  }, [crecheId]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crecheId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('creche-gallery')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('creche-gallery')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('creche_gallery')
        .insert({
          creche_id: crecheId,
          image_url: publicUrl,
          order_index: images.length
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });

      loadGalleryImages();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload image",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string, imageUrl: string) => {
    try {
      // Extract filename from URL
      const fileName = imageUrl.split('/').pop();
      
      // Delete from storage
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from('creche-gallery')
          .remove([fileName]);

        if (storageError) throw storageError;
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('creche_gallery')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Image deleted successfully",
      });

      loadGalleryImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete image",
      });
    }
  };

  const handleUpdateCaption = async (imageId: string, caption: string) => {
    try {
      const { error } = await supabase
        .from('creche_gallery')
        .update({ caption })
        .eq('id', imageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Caption updated successfully",
      });

      loadGalleryImages();
    } catch (error) {
      console.error('Error updating caption:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update caption",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Gallery</span>
          <label className="cursor-pointer">
            <Input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
            <Button variant="outline" disabled={isUploading}>
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span className="ml-2">Upload Image</span>
            </Button>
          </label>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.image_url}
                  alt={image.caption || "Gallery image"}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <div className="space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="secondary" size="sm">
                          Edit Caption
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Caption</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Caption</Label>
                            <Input
                              defaultValue={image.caption}
                              onChange={(e) => handleUpdateCaption(image.id, e.target.value)}
                            />
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteImage(image.id, image.image_url)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-sm truncate rounded-b-lg">
                    {image.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};