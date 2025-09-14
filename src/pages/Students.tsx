import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Download, Plus, Users, Filter, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { StudentList } from "@/components/students/StudentList";
import { ImportStudentsDialog } from "@/components/students/ImportStudentsDialog";
import { StudentProfileDrawer } from "@/components/students/StudentProfileDrawer";
import { ManageClassesDialog } from "@/components/students/ManageClassesDialog";
import { AttendanceSheet } from "@/components/students/AttendanceSheet";
import * as XLSX from 'xlsx';
import { ManageAttendanceDialog } from "@/components/students/ManageAttendanceDialog";
import { StudentListSkeleton } from "@/components/students/StudentListSkeleton";

interface Student {
  id: string;
  name: string;
  class: string | null;
  classColor: string | null;
  parent_name: string | null;
  disabilities_allergies: string | null;
  parent_email: string | null;
  parent_phone_number: string | null;
  address: string | null;
  dob: string | null;
  age: number | null;
}

const Students = () => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [userCreche, setUserCreche] = useState<string | null>(null);
  const { toast } = useToast();
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isClassesDialogOpen, setIsClassesDialogOpen] = useState(false);
  const [isAttendanceDialogOpen, setisAttendanceDialogOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [filters, setFilters] = useState({
    class: "",
    parentName: "",
    disabilitiesAllergies: "",
  });

  // Get user's creche
  useEffect(() => {
    const getUserCreche = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userCrecheData } = await supabase
          .from('user_creche')
          .select('creche_id')
          .eq('user_id', user.id)
          .single();
        
        if (userCrecheData) {
          setUserCreche(userCrecheData.creche_id);
        }
      }
    };

    getUserCreche();
  }, []);

  // Fetch students
  const { data: students = [], isLoading, refetch } = useQuery({
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

  const handleCreateStudent = async (studentData: Partial<Student>) => {
    if (!userCreche) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No creche assigned"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('students')
        .insert([{
          ...studentData,
          creche_id: userCreche,
        }])
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student created successfully"
      });

      setIsProfileDrawerOpen(false);
      refetch();
    } catch (error) {
      console.error('Error creating student:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create student"
      });
    }
  };

  const handleUpdateStudent = async (studentData: Partial<Student>) => {
    if (!selectedStudent) return;

    try {
      const { error } = await supabase
        .from('students')
        .update(studentData)
        .eq('id', selectedStudent.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student updated successfully"
      });

      setIsProfileDrawerOpen(false);
      refetch();
    } catch (error) {
      console.error('Error updating student:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update student"
      });
    }
  };

  const handleImportStudents = async (students: any[]) => {
    if (!userCreche) return;

    try {
      const { error } = await supabase
        .from('students')
        .insert(
          students.map(student => ({
            ...student,
            creche_id: userCreche
          }))
        );

      if (error) throw error;

      toast({
        title: "Success",
        description: `${students.length} students imported successfully`
      });

      refetch();
    } catch (error) {
      console.error('Error importing students:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to import students"
      });
    }
  };

  const handleExportStudents = () => {
    const ws = XLSX.utils.json_to_sheet(students);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "students.xlsx");
  };

  const filteredStudents = students.filter(student => {
    const matchesSearchTerm = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.class && student.class.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesClassFilter = 
      !filters.class || (student.class && student.class.toLowerCase().includes(filters.class.toLowerCase()));

    const matchesParentNameFilter = 
      !filters.parentName || (student.parent_name && student.parent_name.toLowerCase().includes(filters.parentName.toLowerCase()));

    const matchesDisabilitiesAllergiesFilter = 
      !filters.disabilitiesAllergies || (student.disabilities_allergies && student.disabilities_allergies.toLowerCase().includes(filters.disabilitiesAllergies.toLowerCase()));

    return matchesSearchTerm && matchesClassFilter && matchesParentNameFilter && matchesDisabilitiesAllergiesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-primary">Students</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsClassesDialogOpen(true)}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            Manage Classes
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setisAttendanceDialogOpen(true)}
            className="gap-2"
          >
            <BadgeCheck className="h-4 w-4" />
            Manage Attendance
          </Button>
          <ImportStudentsDialog onImport={handleImportStudents} />
          <Button variant="outline" onClick={handleExportStudents} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button 
            onClick={() => {
              setSelectedStudent(null);
              setIsProfileDrawerOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Student
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col gap-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsAttendanceOpen(true)}>
            Take Attendance
          </Button>
        </div>

        <div className="flex gap-4">
          <Input
            placeholder="Filter by class..."
            value={filters.class}
            onChange={(e) => setFilters({ ...filters, class: e.target.value })}
          />
          <Input
            placeholder="Filter by parent name..."
            value={filters.parentName}
            onChange={(e) => setFilters({ ...filters, parentName: e.target.value })}
          />
          <Input
            placeholder="Filter by disabilities/allergies..."
            value={filters.disabilitiesAllergies}
            onChange={(e) => setFilters({ ...filters, disabilitiesAllergies: e.target.value })}
          />
          <Button variant="outline" onClick={() => setFilters({ class: "", parentName: "", disabilitiesAllergies: "" })}>
            <Filter className="h-4 w-4" />
            Clear Filters
          </Button>
        </div>

        {isLoading ? (
          <StudentListSkeleton />
        ) : (
          <StudentList
            students={filteredStudents}
            onEdit={(student) => {
              setSelectedStudent(student);
              setIsProfileDrawerOpen(true);
            }}
          />
        )}
      </div>

      <StudentProfileDrawer
        student={selectedStudent}
        open={isProfileDrawerOpen}
        onOpenChange={setIsProfileDrawerOpen}
        onSave={selectedStudent ? handleUpdateStudent : handleCreateStudent}
      />

      <ManageClassesDialog
        open={isClassesDialogOpen}
        onOpenChange={setIsClassesDialogOpen}
      />

      <ManageAttendanceDialog
        open={isAttendanceDialogOpen}
        onOpenChange={setisAttendanceDialogOpen}
      />

      <AttendanceSheet
        students={students}
        isOpen={isAttendanceOpen}
        onClose={() => setIsAttendanceOpen(false)}
      />
    </div>
  );
};

export default Students;