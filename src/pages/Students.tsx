import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Student {
  id: string;
  name: string;
  class: string;
  parent_name: string;
  disabilities_allergies: string | null;
}

const Students = () => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [userCreche, setUserCreche] = useState<string | null>(null);

  // First, get the user's creche
  useEffect(() => {
    const getUserCreche = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userCrecheData } = await supabase
          .from('user_creche')
          .select('creche_id')
          .eq('user_id', user.id);
        
        if (userCrecheData && userCrecheData.length > 0) {
          setUserCreche(userCrecheData[0].creche_id);
          console.log("User's creche:", userCrecheData[0].creche_id);
        }
      }
    };

    getUserCreche();
  }, []);

  // Then fetch students for that creche
  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students', userCreche],
    queryFn: async () => {
      if (!userCreche) return [];
      
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('creche_id', userCreche);

      if (error) {
        console.error('Error fetching students:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!userCreche
  });

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.class && student.class.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Button 
              variant="outline" 
              className="border-2 border-primary text-primary hover:bg-primary hover:text-white"
            >
              <Mail className="mr-2 h-4 w-4" />
              Email Broadcast: {students.length} students
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
              {isLoading ? (
                <div className="py-4 text-center">Loading students...</div>
              ) : filteredStudents.length === 0 ? (
                <div className="py-4 text-center">No students found</div>
              ) : (
                filteredStudents.map((student) => (
                  <div 
                    key={student.id}
                    className="grid grid-cols-5 gap-4 py-2 border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedStudent(student)}
                  >
                    <div className="underline">{student.id.slice(0, 8)}</div>
                    <div>{student.class || 'Not assigned'}</div>
                    <div>Assigned Teacher</div>
                    <div>{student.parent_name || 'Not specified'}</div>
                    <div>{student.disabilities_allergies || 'None'}</div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Student Details Panel - Only show when a student is selected */}
        {selectedStudent && (
          <Card className="w-full lg:w-80 p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">Student name: {selectedStudent.name}</h3>
              <h3 className="text-lg font-semibold text-primary">Parent info: {selectedStudent.parent_name}</h3>
              <h3 className="text-lg font-semibold text-primary">Assigned classes: {selectedStudent.class}</h3>
              <h3 className="text-lg font-semibold text-primary">Diet & Allergies: {selectedStudent.disabilities_allergies || 'None specified'}</h3>
              <h3 className="text-lg font-semibold text-primary">Medical notes: Not specified</h3>
              <h3 className="text-lg font-semibold text-primary">Doctor info: Not specified</h3>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Students;