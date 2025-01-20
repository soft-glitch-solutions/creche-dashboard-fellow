import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail, Clock, GraduationCap, Building } from "lucide-react";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const applications = {
    received: 5,
    pending: 10,
    toBeContacted: 3,
  };

  const students = {
    gradeR: 15,
    grade0: 12,
    afterCare: 20,
  };

  const crecheProfile = {
    dailyFee: "R250",
    monthlyFee: "R3500",
    services: ["Full day care", "After-care", "Meals included"],
    facilities: ["Playground", "Nap room", "Learning center"],
    address: "123 Sunshine Street, Happy Valley",
    capacity: {
      gradeR: 20,
      grade0: 15,
      afterCare: 25,
    },
    contact: "+27 12 345 6789",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your Creche dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Applications Card */}
        <Card className="border-2 border-secondary/20">
          <CardHeader>
            <CardTitle className="text-xl text-secondary">
              My Applications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Received
              </span>
              <span className="font-bold">{applications.received}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending
              </span>
              <span className="font-bold">{applications.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                To be contacted
              </span>
              <span className="font-bold">{applications.toBeContacted}</span>
            </div>
          </CardContent>
        </Card>

        {/* Creche Profile Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl text-primary">
              My Creche Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Daily fee:</span>
                <span className="font-bold">{crecheProfile.dailyFee}</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly fee:</span>
                <span className="font-bold">{crecheProfile.monthlyFee}</span>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Capacity:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Grade R: {crecheProfile.capacity.gradeR}</div>
                <div>Grade 0: {crecheProfile.capacity.grade0}</div>
                <div>After-care: {crecheProfile.capacity.afterCare}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Card */}
        <Card className="border-2 border-accent/20">
          <CardHeader>
            <CardTitle className="text-xl text-accent">My Students</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Grade R
              </span>
              <span className="font-bold">{students.gradeR}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Grade 0
              </span>
              <span className="font-bold">{students.grade0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                After-care
              </span>
              <span className="font-bold">{students.afterCare}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;