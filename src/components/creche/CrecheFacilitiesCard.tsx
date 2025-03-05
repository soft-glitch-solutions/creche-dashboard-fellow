
import { Edit, Save, Home, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Creche } from "@/types/creche";

interface FacilitiesCardProps {
  crecheData: Creche;
  editMode: boolean;
  onEditToggle: () => void;
  onUpdate: () => void;
  onInputChange: (field: string, value: any) => void; 
}

export const FacilitiesCard = ({
  crecheData,
  editMode,
  onEditToggle,
  onUpdate,
  onInputChange,
}: FacilitiesCardProps) => {
  const handleFacilityChange = (field: string, value: boolean | number) => {
    onInputChange(`facilities.${field}`, value);
  };

  return (
    <div className="border-2 border-primary/20 rounded-lg">
      <div className="flex flex-row items-center justify-between p-4">
        <h2 className="text-lg md:text-xl text-primary flex items-center gap-2">
          <Home className="h-5 w-5" />
          Facilities
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
              { label: "Teachers", field: "teachers", countField: "teachers_count" },
              { label: "Classrooms", field: "classrooms", countField: "classrooms_count" },
              { label: "Toilets", field: "toilets", countField: "toilets_count" },
              { label: "Playground", field: "playground", countField: "playground_count" },
              { label: "Kitchen", field: "kitchen", countField: "kitchen_count" },
              { label: "Parking", field: "parking", countField: "parking_count" },
            ].map(({ label, field, countField }) => (
              <div key={field} className="space-y-2">
                <label className="text-sm text-gray-500 flex items-center gap-2">
                  <Settings className="h-4 w-4" /> {label}
                </label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="checkbox"
                    checked={crecheData.facilities[field as keyof typeof crecheData.facilities] as boolean || false}
                    onChange={(e) => handleFacilityChange(field, e.target.checked)}
                  />
                  <span>Available</span>
                  <Input
                    type="number"
                    value={crecheData.facilities[countField as keyof typeof crecheData.facilities] as number || ''}
                    onChange={(e) => handleFacilityChange(countField, parseInt(e.target.value))}
                    placeholder={`Number of ${label.toLowerCase()}`}
                    className="ml-2"
                  />
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm">
                <Home className="h-4 w-4" /> Teachers: {crecheData.facilities.teachers ? `Yes (${crecheData.facilities.teachers_count})` : "No"}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Home className="h-4 w-4" /> Classrooms: {crecheData.facilities.classrooms ? `Yes (${crecheData.facilities.classrooms_count})` : "No"}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Home className="h-4 w-4" /> Toilets: {crecheData.facilities.toilets ? `Yes (${crecheData.facilities.toilets_count})` : "No"}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Home className="h-4 w-4" /> Playground: {crecheData.facilities.playground ? `Yes (${crecheData.facilities.playground_count})` : "No"}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Home className="h-4 w-4" /> Kitchen: {crecheData.facilities.kitchen ? `Yes (${crecheData.facilities.kitchen_count})` : "No"}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Home className="h-4 w-4" /> Parking: {crecheData.facilities.parking ? `Yes (${crecheData.facilities.parking_count})` : "No"}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
