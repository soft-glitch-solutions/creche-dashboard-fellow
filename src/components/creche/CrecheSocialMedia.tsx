import { Instagram, Facebook, MessageCircle, Edit, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Creche } from "@/types/creche";

interface SocialMediaCardProps {
  crecheData: Creche;
  editMode: boolean;
  onEditToggle: () => void;
  onUpdate: () => void;
  onInputChange: (field: keyof Creche, value: string) => void;
}

export const SocialMediaCard = ({
  crecheData,
  editMode,
  onEditToggle,
  onUpdate,
  onInputChange,
}: SocialMediaCardProps) => {
  return (
    <div className="border-2 border-primary/20 rounded-lg">
      <div className="flex flex-row items-center justify-between p-4">
        <h2 className="text-lg md:text-xl text-secondary flex items-center gap-2">
          <Instagram className="h-5 w-5" />
          Social Media
        </h2>
        {!editMode ? (
          <Button variant="ghost" size="sm" onClick={onEditToggle}>
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={onUpdate}>
            <Save className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {editMode ? (
            [
              { label: "Facebook", icon: <Facebook className="h-4 w-4" />, field: "facebook_url" },
              { label: "Instagram", icon: <Instagram className="h-4 w-4" />, field: "instagram_url" },
              { label: "WhatsApp", icon: <MessageCircle className="h-4 w-4" />, field: "whatsapp_number" },
            ].map(({ label, icon, field }) => (
              <div key={field} className="space-y-2">
                <label className="text-sm text-gray-500 flex items-center gap-2">{icon} {label}</label>
                <Input
                  value={crecheData[field] || ""}
                  onChange={(e) => onInputChange(field as keyof Creche, e.target.value)}
                  placeholder={`${label}`}
                />
              </div>
            ))
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm">
                <Facebook className="h-4 w-4 text-blue-500" /> {crecheData.facebook_url || "Not provided"}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Instagram className="h-4 w-4 text-pink-500" /> {crecheData.instagram_url || "Not provided"}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MessageCircle className="h-4 w-4 text-green-500" /> {crecheData.whatsapp_number || "Not provided"}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};