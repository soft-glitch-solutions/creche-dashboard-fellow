import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, Printer, Plus, X, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PhotoEntry {
  id: string;
  year: number;
  month: number;
  image_url: string;
  caption?: string;
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const PhotoBook = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadPhotos();
  }, [selectedYear, selectedMonth]);

  const loadPhotos = async () => {
    try {
      const { data: userCreche } = await supabase
        .from('user_creche')
        .select('creche_id')
        .single();

      if (!userCreche?.creche_id) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No creche assigned to user",
        });
        return;
      }

      const { data, error } = await supabase
        .from('photobook_entries')
        .select('*')
        .eq('creche_id', userCreche.creche_id)
        .eq('year', selectedYear)
        .eq('month', selectedMonth)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error loading photos:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load photos",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    try {
      setIsUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const { data: userCreche } = await supabase
        .from('user_creche')
        .select('creche_id')
        .single();

      if (!userCreche?.creche_id) throw new Error('No creche assigned');

      const { error: uploadError } = await supabase.storage
        .from('creche-gallery')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('creche-gallery')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('photobook_entries')
        .insert({
          creche_id: userCreche.creche_id,
          year: selectedYear,
          month: selectedMonth,
          image_url: publicUrl,
          caption: caption,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Photo uploaded successfully",
      });

      setCaption("");
      setUploadDialogOpen(false);
      loadPhotos();
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload photo",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string, imageUrl: string) => {
    try {
      // Extract filename from URL
      const fileName = imageUrl.split('/').pop();
      
      if (fileName) {
        await supabase.storage
          .from('creche-gallery')
          .remove([fileName]);
      }

      const { error } = await supabase
        .from('photobook_entries')
        .delete()
        .eq('id', photoId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Photo deleted successfully",
      });

      loadPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete photo",
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Photo Book</h2>
          <p className="text-muted-foreground">
            Capture and organize your creche memories
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Photo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload New Photo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Caption</Label>
                  <Textarea
                    placeholder="Enter a caption for this photo..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Photo</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Book
          </Button>
        </div>
      </div>

      {/* Date Selection */}
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(parseInt(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedMonth.toString()}
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={index + 1} value={(index + 1).toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Photos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2">
        {photos.map((photo) => (
          <Card key={photo.id} className="overflow-hidden">
            <div className="relative aspect-[4/3] group">
              <img
                src={photo.image_url}
                alt={photo.caption || "Photo"}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleDeletePhoto(photo.id, photo.image_url)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {photo.caption && (
              <CardContent className="p-4">
                <p className="text-sm text-center">{photo.caption}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {photos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No photos found for this month.</p>
          <p className="text-sm text-muted-foreground">
            Click the "Add Photo" button to start building your photo book.
          </p>
        </div>
      )}
    </div>
  );
};

export default PhotoBook;