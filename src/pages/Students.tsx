import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, Search, Plus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  name: string;
  class: string | null;
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
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // New student form state
  const [newStudent, setNewStudent] = useState({
    name: "",
    parent_name: "",
    parent_email: "",
    parent_phone_number: "",
    address: "",
    class: "",
    disabilities_allergies: "",
    dob: "",
    age: "",
  });

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

  const handleCreateStudent = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert([{
          ...newStudent,
          creche_id: userCreche,
          age: parseInt(newStudent.age)
        }])
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student created successfully"
      });

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

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.class && student.class.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-primary">Students</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Student
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Student Name</Label>
                <Input
                  id="name"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="parent_name">Parent Name</Label>
                <Input
                  id="parent_name"
                  value={newStudent.parent_name}
                  onChange={(e) => setNewStudent(prev => ({
                    ...prev,
                    parent_name: e.target.value
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="parent_email">Parent Email</Label>
                <Input
                  id="parent_email"
                  type="email"
                  value={newStudent.parent_email}
                  onChange={(e) => setNewStudent(prev => ({
                    ...prev,
                    parent_email: e.target.value
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="parent_phone">Parent Phone</Label>
                <Input
                  id="parent_phone"
                  value={newStudent.parent_phone_number}
                  onChange={(e) => setNewStudent(prev => ({
                    ...prev,
                    parent_phone_number: e.target.value
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newStudent.address}
                  onChange={(e) => setNewStudent(prev => ({
                    ...prev,
                    address: e.target.value
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="class">Class</Label>
                <Input
                  id="class"
                  value={newStudent.class}
                  onChange={(e) => setNewStudent(prev => ({
                    ...prev,
                    class: e.target.value
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={newStudent.dob}
                  onChange={(e) => setNewStudent(prev => ({
                    ...prev,
                    dob: e.target.value
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={newStudent.age}
                  onChange={(e) => setNewStudent(prev => ({
                    ...prev,
                    age: e.target.value
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="disabilities_allergies">Special Needs/Allergies</Label>
                <Input
                  id="disabilities_allergies"
                  value={newStudent.disabilities_allergies}
                  onChange={(e) => setNewStudent(prev => ({
                    ...prev,
                    disabilities_allergies: e.target.value
                  }))}
                />
              </div>
            </div>
            <Button onClick={handleCreateStudent}>Create Student</Button>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
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

          <Card className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-4 text-lg font-semibold text-primary">
                <div>Student Name</div>
                <div>Class</div>
                <div>Parent</div>
                <div>Contact</div>
                <div>Notes</div>
              </div>

              {isLoading ? (
                <div className="py-4 text-center">Loading students...</div>
              ) : paginatedStudents.length === 0 ? (
                <div className="py-4 text-center">No students found</div>
              ) : (
                paginatedStudents.map((student) => (
                  <div 
                    key={student.id}
                    className="grid grid-cols-5 gap-4 py-2 border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedStudent(student)}
                  >
                    <div className="font-medium">{student.name}</div>
                    <div>{student.class || 'Not assigned'}</div>
                    <div>{student.parent_name || 'Not specified'}</div>
                    <div>{student.parent_phone_number || 'Not provided'}</div>
                    <div>{student.disabilities_allergies || 'None'}</div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {selectedStudent && (
          <Card className="w-full lg:w-80 p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">Student Details</h3>
              <div className="space-y-2">
                <p><strong>Name:</strong> {selectedStudent.name}</p>
                <p><strong>Class:</strong> {selectedStudent.class || 'Not assigned'}</p>
                <p><strong>Age:</strong> {selectedStudent.age || 'Not specified'}</p>
                <p><strong>Parent:</strong> {selectedStudent.parent_name}</p>
                <p><strong>Contact:</strong> {selectedStudent.parent_phone_number}</p>
                <p><strong>Email:</strong> {selectedStudent.parent_email}</p>
                <p><strong>Address:</strong> {selectedStudent.address}</p>
                <p><strong>Special Needs/Allergies:</strong> {selectedStudent.disabilities_allergies || 'None'}</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Students;