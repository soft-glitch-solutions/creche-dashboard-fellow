import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DollarSign, Edit, Save, CheckSquare, Square } from "lucide-react";

const PlanAndFeaturesCard = ({
  crecheData,
  editForm,
  isEditing,
  onToggleEdit,
  onSave,
  onFeatureToggle,
}) => {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Plan & Features
          <Button
            variant="link"
            onClick={onToggleEdit}
            className="ml-auto p-0"
          >
            {isEditing ? <Save className="h-5 w-5 text-green-500" /> : <Edit className="h-5 w-5 text-blue-500" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Subscription Plan</Label>
          {isEditing ? (
            <Select
              value={editForm.plan}
              onValueChange={(value) => onChange("plan", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="capitalize">{crecheData.plan}</div>
          )}
        </div>

        <div className="space-y-4">
          <Label>Enabled Features</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(editForm.features).map(([feature, enabled]) => (
              <div key={feature} className="flex items-center space-x-2">
                {isEditing ? (
                  <Checkbox
                    checked={enabled}
                    onCheckedChange={() => onFeatureToggle(feature)}
                  />
                ) : (
                  enabled ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />
                )}
                <Label className="capitalize">{feature.replace(/_/g, ' ')}</Label>
              </div>
            ))}
          </div>
        </div>

        {isEditing && (
          <Button onClick={onSave}>Save Changes</Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanAndFeaturesCard;