import { Building2, GraduationCap, Clock } from "lucide-react";

export const StudentsCard = () => {
  return (
    <div className="md:col-span-2 border-2 border-accent/20 rounded-lg">
      <div className="p-4">
        <h2 className="text-lg md:text-xl text-accent flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Students
        </h2>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 rounded-lg">
            <span className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Grade R
            </span>
            <span className="font-bold">15</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg">
            <span className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Grade 0
            </span>
            <span className="font-bold">12</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg">
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              After-care
            </span>
            <span className="font-bold">20</span>
          </div>
        </div>
      </div>
    </div>
  );
};