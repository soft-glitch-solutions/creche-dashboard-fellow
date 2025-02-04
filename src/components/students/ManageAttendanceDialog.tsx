import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, X } from "lucide-react";

interface Student {
  id: string;
  name: string;
}

interface AttendanceStatus {
  id: string; // student ID
  status: "present" | "late" | "absent"; // typed status
  student_id: string; // reference to the student
  attendance_date: string; // today's date
}

interface ManageAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ManageAttendanceDialog = ({ open, onOpenChange }: ManageAttendanceDialogProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceStatus[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchStudents();
      fetchAttendance(); // Fetch attendance for today
    }
  }, [open]);

  // Fetch the list of students
  const fetchStudents = async () => {
    try {
      const { data: students, error } = await supabase.from("students").select("*");
      if (error) throw error;

      setStudents(students || []);
    } catch (error) {
      console.error("Error fetching students:", error.message);
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch students" });
    }
  };

  // Fetch today's attendance and populate the list
  const fetchAttendance = async () => {
    try {
      const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
      const { data: attendance, error } = await supabase
        .from("attendance_students")
        .select("*")
        .eq("attendance_date", today); // Only fetch today's attendance

      if (error) throw error;

      // Explicitly cast the status field to the correct type
      const formattedAttendance = (attendance || []).map((att) => ({
        ...att,
        status: att.status as "present" | "late" | "absent", // Cast the status
      }));

      setAttendance(formattedAttendance); // Store the fetched attendance data
    } catch (error) {
      console.error("Error fetching attendance:", error.message);
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch attendance" });
    }
  };

  // Function to update attendance status for a specific student
  const updateAttendance = async (studentId: string, status: "present" | "late" | "absent") => {
    try {
      const today = new Date().toISOString().split("T")[0]; // Today's date
      const existingAttendance = attendance.find((att) => att.student_id === studentId);

      if (existingAttendance) {
        // Update the attendance status for the student if they already have an entry
        const { error } = await supabase
          .from("attendance_students")
          .update({ status })
          .eq("student_id", studentId)
          .eq("attendance_date", today);

        if (error) throw error;

        toast({ title: "Success", description: "Attendance updated successfully" });
      } else {
        // If no attendance entry exists for this student today, create a new one
        const { error } = await supabase
          .from("attendance_students")
          .insert([{ student_id: studentId, status, attendance_date: today }]);

        if (error) throw error;

        toast({ title: "Success", description: "Attendance marked successfully" });
      }

      // Re-fetch the updated attendance records
      fetchAttendance();
    } catch (error) {
      console.error("Error updating attendance:", error.message);
      toast({ variant: "destructive", title: "Error", description: "Failed to update attendance" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Attendance</DialogTitle>
        </DialogHeader>
        
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 shadow-sm">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">Student Name</th>
                <th className="p-2 text-left">Attendance Status</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                // Check if the student has an attendance entry for today
                const studentAttendance = attendance.find((att) => att.student_id === student.id);

                return (
                  <tr key={student.id} className="border-b">
                    <td className="p-2">{student.name}</td>
                    <td className="p-2">
                      {studentAttendance ? (
                        <span>{studentAttendance.status}</span>
                      ) : (
                        <span>No status</span>
                      )}
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateAttendance(student.id, "present")}
                          disabled={studentAttendance?.status === "present"} // Disable if already present
                        >
                          Present
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateAttendance(student.id, "late")}
                          disabled={studentAttendance?.status === "late"} // Disable if already late
                        >
                          Late
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateAttendance(student.id, "absent")}
                          disabled={studentAttendance?.status === "absent"} // Disable if already absent
                        >
                          Absent
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
};
