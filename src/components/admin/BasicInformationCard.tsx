import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Edit, Save } from "lucide-react";

const BasicInformationCard = ({
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
          <Settings className="h-5 w-5" />
          Basic Information
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
          <Label>Name</Label>
          {isEditing ? (
            <Input
              value={editForm.name}
              onChange={(e) => onChange("name", e.target.value)}
            />
          ) : (
            <div>{crecheData.name}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Address</Label>
          {isEditing ? (
            <Input
              value={editForm.address}
              onChange={(e) => onChange("address", e.target.value)}
            />
          ) : (
            <div>{crecheData.address}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Phone Number</Label>
          {isEditing ? (
            <Input
              value={editForm.phone_number}
              onChange={(e) => onChange("phone_number", e.target.value)}
            />
          ) : (
            <div>{crecheData.phone_number}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          {isEditing ? (
            <Input
              value={editForm.email}
              onChange={(e) => onChange("email", e.target.value)}
            />
          ) : (
            <div>{crecheData.email}</div>
          )}
        </div>

        {isEditing && (
          <Button onClick={onSave}>Save Changes</Button>
        )}
      </CardContent>
    </Card>
  );
};

export default BasicInformationCard;