import { Edit, Save, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Creche } from "@/types/creche";

interface ServicesCardProps {
  crecheData: Creche;
  editMode: boolean;
  onEditToggle: () => void;
  onUpdate: () => void;
  onInputChange: (field: keyof Creche, value: boolean) => void;
}

export const ServicesCard = ({
  crecheData,
  editMode,
  onEditToggle,
  onUpdate,
  onInputChange,
}: ServicesCardProps) => {
  return (
    <div className="border-2 border-primary/20 rounded-lg">
      <div className="flex flex-row items-center justify-between p-4">
        <h2 className="text-lg md:text-xl text-primary flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Services Offered
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {editMode ? (
            [
              { label: "Full-time Care", field: "full_time_care" },
              { label: "Part-time Care", field: "part_time_care" },
              { label: "After-school Care", field: "after_school_care" },
              { label: "Meals Provided", field: "meals_provided" },
              { label: "Transportation", field: "transportation" },
              { label: "Special Education", field: "special_education" },
            ].map(({ label, field }) => (
              <div key={field} className="space-y-2">
                <label className="text-sm text-gray-500 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" /> {label}
                </label>
                <input
                  type="checkbox"
                  checked={crecheData.services[field] || false}
                  onChange={(e) => onInputChange(field, e.target.checked)}
                />
                <span>Available</span>
              </div>
            ))
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm">
                <ClipboardList className="h-4 w-4" /> Full-time Care: {crecheData.services.full_time_care ? "Yes" : "No"}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ClipboardList className="h-4 w-4" /> Part-time Care: {crecheData.services.part_time_care ? "Yes" : "No"}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ClipboardList className="h-4 w-4" /> After-school Care: {crecheData.services.after_school_care ? "Yes" : "No"}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ClipboardList className="h-4 w-4" /> Meals Provided: {crecheData.services.meals_provided ? "Yes" : "No"}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ClipboardList className="h-4 w-4" /> Transportation: {crecheData.services.transportation ? "Yes" : "No"}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ClipboardList className="h-4 w-4" /> Special Education: {crecheData.services.special_education ? "Yes" : "No"}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
