
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, ArrowLeft, Trash2, Download, Calendar, Loader2 } from "lucide-react";
import { Student, StudentDocument } from "@/types/student";
import { StudentDocumentUpload } from "@/components/students/StudentDocumentUpload";
import { useToast } from "@/hooks/use-toast";
import { StudentProfileDrawer } from "@/components/students/StudentProfileDrawer";
import { format } from "date-fns";
import CalendarHeatmap from "react-calendar-heatmap";
import "./heatmapStyles.css";


const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const { toast } = useToast();

  const fetchStudentData = async () => {
    try {
      // Fetch student details
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("*")
        .eq("id", id)
        .single();

      if (studentError) throw studentError;
      setStudent(studentData);

      // Fetch documents
      const { data: documentsData, error: documentsError } = await supabase
        .from("student_documents")
        .select("*")
        .eq("student_id", id);

      if (documentsError) throw documentsError;
      setDocuments(documentsData);

      // Fetch invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from("invoices")
        .select("*")
        .eq("student_id", id);

      if (invoicesError) throw invoicesError;
      setInvoices(invoicesData);

      // Fetch attendance
      const { data: attendanceData, error: attendanceError } = await supabase
        .from("attendance_students")
        .select("*")
        .eq("student_id", id)
        .order("attendance_date", { ascending: false });

      if (attendanceError) throw attendanceError;
      setAttendance(attendanceData);
    } catch (error) {
      console.error("Error fetching student data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load student data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchStudentData();
    }
  }, [id]);

  const handleDeleteDocument = async (documentId: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('student-documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('student_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });

      // Refresh documents list
      fetchStudentData();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete document",
      });
    }
  };

  const handleUpdateStudent = async (updatedData: Partial<Student>) => {
    try {
      const { error } = await supabase
        .from("students")
        .update(updatedData)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student profile updated successfully",
      });

      setIsProfileDrawerOpen(false);
      fetchStudentData();
    } catch (error) {
      console.error("Error updating student:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update student profile",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!student) {
    return <div className="text-center p-6">Student not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="outline" className="flex items-center gap-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-5 w-5" />
        Back
      </Button>

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
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => setIsProfileDrawerOpen(true)}
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      </Card>

      <Tabs defaultValue="info">
        <TabsList className="grid grid-cols-5 bg-muted p-1 rounded-lg">
          <TabsTrigger value="info">Student Info</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card className="p-6 space-y-4">
            <div><strong>Parent Name:</strong> {student.parent_name || "Not Provided"}</div>
            <div><strong>Email:</strong> {student.parent_email || "Not Provided"}</div>
            <div><strong>Phone:</strong> {student.parent_phone_number || "Not Provided"}</div>
            <div><strong>WhatsApp:</strong> {student.parent_whatsapp || "Not Provided"}</div>
            <div><strong>Address:</strong> {student.address || "Not Provided"}</div>
            <div><strong>Date of Birth:</strong> {student.dob || "Not Provided"}</div>
            <div><strong>Age:</strong> {student.age ? `${student.age} years` : "Not Provided"}</div>
            <div><strong>Special Needs/Allergies:</strong> {student.disabilities_allergies || "None"}</div>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card className="p-6 space-y-6">
            <StudentDocumentUpload studentId={student.id} onUploadComplete={fetchStudentData} />
            
            <div className="space-y-4">
              {documents.length === 0 ? (
                <p className="text-muted-foreground">No documents uploaded yet.</p>
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{doc.file_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Uploaded on {format(new Date(doc.uploaded_at), "PPP")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => window.open(doc.file_url, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteDocument(doc.id, doc.file_url)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-4">Attendance Overview</h3>
    {attendance.length === 0 ? (
      <p className="text-muted-foreground">No attendance records found.</p>
    ) : (
<CalendarHeatmap
  startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
  endDate={new Date()}
  values={attendance.map((record) => ({
    date: record.attendance_date,
    status: record.status,
  }))}

  classForValue={(value) => {
    if (!value) return "heatmap-empty";
    return value.status === "Present"
      ? "heatmap-present"
      : value.status === "Absent"
      ? "heatmap-absent"
      : "heatmap-late"; // Late
  }}

  tooltipDataAttrs={(value) => {
    if (!value || !value.date) {
      return { "data-tooltip": "No attendance record" };
    }
    return { "data-tooltip": `${value.date}: ${value.status}` };
  }}
/>



    )}
  </Card>
</TabsContent>

        <TabsContent value="financial">
          <Card className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Fees Overview</h3>
              <Button variant="outline" onClick={() => navigate('/dashboard/finance/invoice/new', { state: { studentId: student.id } })}>
                Create Invoice
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Fees Owed</p>
                <p className="text-2xl font-bold">R{student.fees_owed || 0}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Fees Paid</p>
                <p className="text-2xl font-bold">R{student.fees_paid || 0}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Recent Invoices</h4>
              {invoices.length === 0 ? (
                <p className="text-muted-foreground">No invoices found.</p>
              ) : (
                invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{invoice.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Created on {format(new Date(invoice.created_at), "PPP")}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-medium">R{invoice.total_amount}</p>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/dashboard/finance/invoice/${invoice.id}`)}
                      >
                        View Invoice
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card className="p-6">
            <p className="text-muted-foreground">Parent notes feature coming soon.</p>
          </Card>
        </TabsContent>
      </Tabs>

      <StudentProfileDrawer
        student={student}
        open={isProfileDrawerOpen}
        onOpenChange={setIsProfileDrawerOpen}
        onSave={handleUpdateStudent}
      />
    </div>
  );
};

export default StudentProfile;
