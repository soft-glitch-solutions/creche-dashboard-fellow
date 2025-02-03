import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Navigate for back button
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, ArrowLeft } from "lucide-react";

interface Student {
  id: string;
  name: string;
  class: string | null;
  parent_name: string | null;
  parent_email: string | null;
  parent_phone_number: string | null;
  address: string | null;
  dob: string | null;
  age: number | null;
  financial_info: string | null; // Add financial info property
  parent_notes: string | null; // Add parent notes property
}

const StudentProfile = () => {
  const { id } = useParams(); // Get student ID from URL
  const navigate = useNavigate(); // For back navigation
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    const fetchStudent = async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching student:", error);
      } else {
        setStudent(data);
      }
    };

    if (id) {
      fetchStudent();
    }
  }, [id]);

  if (!student) {
    return <div className="text-center p-6">Loading student data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Button variant="outline" className="flex items-center gap-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-5 w-5" />
        Back
      </Button>

      {/* Student Header */}
      <Card className="p-6 flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <div className="bg-primary text-primary-foreground w-full h-full flex items-center justify-center text-2xl font-medium">
            {student.name.charAt(0)}
          </div>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{student.name}</h1>
          <p className="text-muted-foreground">{student.class || "Unassigned"}</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="info">
        <TabsList className="grid grid-cols-5 bg-muted p-1 rounded-lg">
          <TabsTrigger value="info">Student Info</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger> {/* New Financial Tab */}
          <TabsTrigger value="parentNotes">Parent Notes</TabsTrigger> {/* New Parent Notes Tab */}
        </TabsList>

        {/* Student Info Tab */}
        <TabsContent value="info">
          <Card className="p-6 space-y-4">
            <div><strong>Email:</strong> {student.parent_email || "Not Provided"}</div>
            <div><strong>Phone:</strong> {student.parent_phone_number || "Not Provided"}</div>
            <div><strong>Address:</strong> {student.address || "Not Provided"}</div>
            <div><strong>Birthday:</strong> {student.dob || "Not Provided"}</div>
            <div><strong>Age:</strong> {student.age ? `${student.age} years` : "Not Provided"}</div>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card className="p-6">
            <p>📂 No documents uploaded yet.</p>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance">
          <Card className="p-6">
            <p>📅 Attendance records will be displayed here.</p>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial">
          <Card className="p-6 space-y-4">
            <div><strong>Tuition Fees:</strong> {student.financial_info?.tuitionFees || "Not Provided"}</div>
            <div><strong>Outstanding Balance:</strong> {student.financial_info?.outstandingBalance || "Not Provided"}</div>
            <div><strong>Payment Status:</strong> {student.financial_info?.paymentStatus || "Not Provided"}</div>
          </Card>
        </TabsContent>

        {/* Parent Notes Tab */}
        <TabsContent value="parentNotes">
          <Card className="p-6 space-y-4">
            <div><strong>Parent Notes:</strong> {student.parent_notes || "No notes from parents."}</div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentProfile;
