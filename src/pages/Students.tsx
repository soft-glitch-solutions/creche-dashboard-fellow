import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const Students = () => {
  const students = [
    {
      studentNo: "NDXDEL003",
      classes: "Grade 0: Aftercare",
      teacher: "Ms Honey",
      guardian: "Ms Naicker",
      notes: "Halal",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-primary">Students</h1>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          {/* Sort/Filter and Email Broadcast Section */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Sort/Filter"
                  className="pl-9"
                />
              </div>
            </div>
            <Button 
              variant="outline" 
              className="border-2 border-primary text-primary hover:bg-primary hover:text-white"
            >
              <Mail className="mr-2 h-4 w-4" />
              Email Broadcast: 20 people
            </Button>
          </div>

          {/* Students Table */}
          <Card className="p-6">
            <div className="space-y-4">
              {/* Headers */}
              <div className="grid grid-cols-5 gap-4 text-lg font-semibold text-primary">
                <div>Student no:</div>
                <div>Classes:</div>
                <div>Teacher:</div>
                <div>Guardian:</div>
                <div>Notes:</div>
              </div>

              {/* Student Rows */}
              {students.map((student, index) => (
                <div 
                  key={index}
                  className="grid grid-cols-5 gap-4 py-2 border-b hover:bg-gray-50 cursor-pointer"
                >
                  <div className="underline">{student.studentNo}</div>
                  <div>{student.classes}</div>
                  <div>{student.teacher}</div>
                  <div>{student.guardian}</div>
                  <div>{student.notes}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Student Details Panel */}
        <Card className="w-full lg:w-80 p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Student name:</h3>
            <h3 className="text-lg font-semibold text-primary">Parent info:</h3>
            <h3 className="text-lg font-semibold text-primary">Assigned classes:</h3>
            <h3 className="text-lg font-semibold text-primary">Diet & Allergies:</h3>
            <h3 className="text-lg font-semibold text-primary">Medical notes:</h3>
            <h3 className="text-lg font-semibold text-primary">Doctor info:</h3>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Students;