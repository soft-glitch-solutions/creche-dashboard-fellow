
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Loader2 } from "lucide-react";

interface ApplicationDocumentUploadProps {
  applicationId: string;
  onUploadComplete: () => void;
}

export const ApplicationDocumentUpload = ({ 
  applicationId, 
  onUploadComplete 
}: ApplicationDocumentUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${applicationId}/${Math.random()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('application-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('application-documents')
        .getPublicUrl(filePath);

      // Save document record
      const { error: dbError } = await supabase
        .from('application_documents')
        .insert({
          application_id: applicationId,
          file_name: file.name,
          file_url: publicUrl,
          file_type: file.type,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
      
      onUploadComplete();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload document",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        disabled={isUploading}
        className="max-w-xs"
      />
      {isUploading ? (
        <Button disabled>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Uploading...
        </Button>
      ) : (
        <Button onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      )}
    </div>
  );
};
