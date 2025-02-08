import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox component
import { Users, Edit, Save } from "lucide-react";

const AdditionalInformationCard = ({
  crecheData,
  editForm,
  isEditing,
  onToggleEdit,
  onSave,
  onChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Additional Information
          <Button
            variant="link"
            onClick={onToggleEdit}
            className="ml-auto p-0"
          >
            {isEditing ? <Save className="h-5 w-5 text-green-500" /> : <Edit className="h-5 w-5 text-blue-500" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Capacity</Label>
          {isEditing ? (
            <Input
              type="number"
              value={editForm.capacity}
              onChange={(e) => onChange("capacity", parseInt(e.target.value) || 0)}
            />
          ) : (
            <div>{crecheData.capacity}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Operating Hours</Label>
          {isEditing ? (
            <Input
              value={editForm.operating_hours}
              onChange={(e) => onChange("operating_hours", e.target.value)}
            />
          ) : (
            <div>{crecheData.operating_hours}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Website URL</Label>
          {isEditing ? (
            <Input
              value={editForm.website_url}
              onChange={(e) => onChange("website_url", e.target.value)}
            />
          ) : (
            <div>{crecheData.website_url}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          {isEditing ? (
            <Textarea
              value={editForm.description}
              onChange={(e) => onChange("description", e.target.value)}
            />
          ) : (
            <div>{crecheData.description}</div>
          )}
        </div>

        {/* Registration Status */}
        <div className="space-y-2">
          <Label>Registration Status</Label>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={editForm.registered}
                onCheckedChange={(checked) => onChange("registered", checked)}
              />
              <span>{editForm.registered ? "Registered" : "Not Registered"}</span>
            </div>
          ) : (
            <div>{crecheData.registered ? "✅ Registered" : "❌ Not Registered"}</div>
          )}
        </div>

        {isEditing && <Button onClick={onSave}>Save Changes</Button>}
      </CardContent>
    </Card>
  );
};

export default AdditionalInformationCard;
