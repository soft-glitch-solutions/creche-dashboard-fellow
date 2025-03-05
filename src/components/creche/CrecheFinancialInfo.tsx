
import { Users, Edit, Save, Banknote } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Creche } from "@/types/creche";

interface FinancialInfoCardProps {
  crecheData: Creche;
  editMode: boolean;
  onEditToggle: () => void;
  onUpdate: () => void;
  onInputChange: (field: string, value: string | number) => void;
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

            <h2 className="text-lg md:text-xl text-primary flex items-center gap-2">
            <Banknote className="h-5 w-5" />
               Bank Details
            </h2>

            {/* Bank Account Details Section */}
            <div className="space-y-2">
              <label className="text-sm text-gray-500">Bank Name</label>
              <Input
                value={crecheData.bank_name || ''}
                onChange={(e) => onInputChange('bank_name', e.target.value)}
                placeholder="Bank name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-500">Account Holder</label>
              <Input
                value={crecheData.account_holder || ''}
                onChange={(e) => onInputChange('account_holder', e.target.value)}
                placeholder="Account holder"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-500">Account Number</label>
              <Input
                value={crecheData.account_number || ''}
                onChange={(e) => onInputChange('account_number', e.target.value)}
                placeholder="Account number"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-500">Branch Code</label>
              <Input
                value={crecheData.branch_code || ''}
                onChange={(e) => onInputChange('branch_code', e.target.value)}
                placeholder="Branch code"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-500">Account Type</label>
              <Input
                value={crecheData.account_type || ''}
                onChange={(e) => onInputChange('account_type', e.target.value)}
                placeholder="Account type"
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
            
            <h2 className="text-lg md:text-xl text-primary flex items-center gap-2">
            <Banknote className="h-5 w-5" />
               Bank Details
            </h2>

            {/* Display Bank Account Details */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Bank Name:</span>
                <span>{crecheData.bank_name || "Not provided"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Account Holder:</span>
                <span>{crecheData.account_holder || "Not provided"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Account Number:</span>
                <span>{crecheData.account_number || "Not provided"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Branch Code:</span>
                <span>{crecheData.branch_code || "Not provided"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Account Type:</span>
                <span>{crecheData.account_type || "Not provided"}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
