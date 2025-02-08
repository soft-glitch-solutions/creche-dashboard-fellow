import { Users, Edit, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Creche } from "@/types/creche";

interface FinancialInfoCardProps {
  crecheData: Creche;
  editMode: boolean;
  onEditToggle: () => void;
  onUpdate: () => void;
  onInputChange: (field: keyof Creche, value: string | number) => void;
}

export const FinancialInfoCard = ({
  crecheData,
  editMode,
  onEditToggle,
  onUpdate,
  onInputChange,
}: FinancialInfoCardProps) => {
  return (
    <div className="border-2 border-primary/20 rounded-lg">
      <div className="flex flex-row items-center justify-between p-4">
        <h2 className="text-lg md:text-xl text-primary flex items-center gap-2">
          <Users className="h-5 w-5" />
          Financial Information
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
              <label className="text-sm text-gray-500">Daily Fee</label>
              <Input
                type="number"
                value={crecheData.price || ''}
                onChange={(e) => onInputChange('price', parseFloat(e.target.value))}
                placeholder="Daily fee"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-500">Weekly Fee</label>
              <Input
                type="number"
                value={crecheData.weekly_price || ''}
                onChange={(e) => onInputChange('weekly_price', parseFloat(e.target.value))}
                placeholder="Weekly fee"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-500">Monthly Fee</label>
              <Input
                type="number"
                value={crecheData.monthly_price || ''}
                onChange={(e) => onInputChange('monthly_price', parseFloat(e.target.value))}
                placeholder="Monthly fee"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-500">Capacity</label>
              <Input
                type="number"
                value={crecheData.capacity || ''}
                onChange={(e) => onInputChange('capacity', parseInt(e.target.value))}
                placeholder="Capacity"
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Daily fee:</span>
                <span className="font-bold">R{crecheData.price || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Weekly fee:</span>
                <span className="font-bold">R{crecheData.weekly_price || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Monthly fee:</span>
                <span className="font-bold">R{crecheData.monthly_price || 0}</span>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Capacity:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Total: {crecheData.capacity || 0}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};