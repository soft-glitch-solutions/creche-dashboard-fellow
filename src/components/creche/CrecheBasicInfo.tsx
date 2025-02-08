import { Mail, Phone, Clock, Edit, Save, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Creche } from "@/types/creche";

interface BasicInfoCardProps {
  crecheData: Creche;
  editMode: boolean;
  onEditToggle: () => void;
  onUpdate: () => void;
  onInputChange: (field: keyof Creche, value: string) => void;
}

export const BasicInfoCard = ({
  crecheData,
  editMode,
  onEditToggle,
  onUpdate,
  onInputChange,
}: BasicInfoCardProps) => {
  return (
    <div className="border-2 border-secondary/20 rounded-lg">
      <div className="flex flex-row items-center justify-between p-4">
        <h2 className="text-lg md:text-xl text-secondary flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Basic Information
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
      <div className="p-4 space-y-4">
        {editMode ? (
          <>
            <div className="space-y-2">
              <label className="text-sm text-gray-500">Creche Name</label>
              <Input
                value={crecheData.name || ''}
                onChange={(e) => onInputChange('name', e.target.value)}
                placeholder="Creche name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-500">Phone Number</label>
              <Input
                value={crecheData.phone_number || ''}
                onChange={(e) => onInputChange('phone_number', e.target.value)}
                placeholder="Phone number"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-500">Email</label>
              <Input
                value={crecheData.email || ''}
                onChange={(e) => onInputChange('email', e.target.value)}
                placeholder="Email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-500">Operating Hours</label>
              <Input
                value={crecheData.operating_hours || ''}
                onChange={(e) => onInputChange('operating_hours', e.target.value)}
                placeholder="Operating hours"
              />
            </div>
            {/* Larger Description Field */}
            <div className="space-y-2">
              <label className="text-sm text-gray-500">Description</label>
              <textarea
                className="w-full p-2 border rounded-lg resize-none"
                value={crecheData.description || ''}
                onChange={(e) => onInputChange('description', e.target.value)}
                placeholder="Description"
                rows={4} // Adjust the number of rows for the height of the textarea
              />
            </div>
            {/* Other Fields */}
            <div className="space-y-2">
              <label className="text-sm text-gray-500">Address</label>
              <Input
                value={crecheData.address || ''}
                onChange={(e) => onInputChange('address', e.target.value)}
                placeholder="Address"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-500">Capacity</label>
              <Input
                type="number"
                value={crecheData.capacity || ''}
                onChange={(e) => onInputChange('capacity', e.target.value)}
                placeholder="Capacity"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-500">Website</label>
              <Input
                value={crecheData.website_url || ''}
                onChange={(e) => onInputChange('website_url', e.target.value)}
                placeholder="Website URL"
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-medium">Creche Name:</span>
              {crecheData.name || "No name provided"}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Phone className="h-4 w-4" />
              {crecheData.phone_number || "No phone number provided"}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Mail className="h-4 w-4" />
              {crecheData.email || "No email provided"}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              {crecheData.operating_hours || "Operating hours not specified"}
            </div>
            {/* Display Additional Fields */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              {crecheData.address || "Address not provided"}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-medium">Description:</span>
              {crecheData.description || "No description provided"}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-medium">Capacity:</span>
              {crecheData.capacity || "Not specified"}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
