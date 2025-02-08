import { useState } from "react";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Creche } from "@/types/creche";

interface CrecheHeaderProps {
  crecheData: Creche;
  onLogoUpdate: (logoUrl: string) => void;
}

export const CrecheHeader = ({ crecheData, onLogoUpdate }: CrecheHeaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crecheData.id}-logo-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('creches')
        .update({ logo: publicUrl })
        .eq('id', crecheData.id);

      if (updateError) throw updateError;

      onLogoUpdate(publicUrl);
      toast({
        title: "Success",
        description: "Logo updated successfully",
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload logo",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center justify-between rounded-lg p-4 shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={crecheData.logo || "/lovable-uploads/b36d0e6b-5fa8-43e2-b837-5d0b3de9e849.png"}
            alt="Creche Logo"
            className="w-16 h-16 rounded-full object-cover"
          />
          <label className="absolute bottom-0 right-0 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
              disabled={isUploading}
            />
            <Upload className="h-5 w-5 hover:text-gray-700" />
          </label>
        </div>
        <h1 className="text-3xl font-bold">{crecheData.name}</h1>
      </div>
    </div>
  );
};