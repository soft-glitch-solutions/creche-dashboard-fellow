import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Student {
  id: string;
  name: string;
  creche_id: string;
}

interface AttendanceStatus {
  id: string;
  status: "present" | "late" | "absent";
  student_id: string;
  attendance_date: string;
}

interface ManageAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ManageAttendanceDialog = ({ open, onOpenChange }: ManageAttendanceDialogProps) => {
  const [crecheId, setCrecheId] = useState<string | null>(null);
  const { toast } = useToast();

  // Get user's creche_id
  useEffect(() => {
    if (open) {
      const getUserCreche = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userCrecheData } = await supabase
            .from("user_creche")
            .select("creche_id")
            .eq("user_id", user.id)
            .single();
          
          if (userCrecheData) {
            setCrecheId(userCrecheData.creche_id);
          }
        }
      };

      getUserCreche();
    }
  }, [open]);

  // Fetch students for the creche
  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ["students", crecheId],
    queryFn: async () => {
      if (!crecheId) return [];
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("creche_id", crecheId);
      if (error) {
        console.error("Error fetching students:", error);
        return [];
      }
      return data || [];
    },
    enabled: !!crecheId,
  });

  // Fetch today's attendance for the students in the creche
  const { data: attendance = [], isLoading: isLoadingAttendance } = useQuery({
    queryKey: ["attendance", crecheId],
    queryFn: async () => {
      if (!crecheId) return [];
      const today = new Date().toISOString().split("T")[0];

      const { data: studentList } = await supabase
        .from("students")
        .select("id")
        .eq("creche_id", crecheId);

      const studentIds = studentList?.map((s) => s.id) || [];

      if (studentIds.length === 0) return [];

      const { data, error } = await supabase
        .from("attendance_students")
        .select("*")
        .eq("attendance_date", today)
        .in("student_id", studentIds);

      if (error) {
        console.error("Error fetching attendance:", error);
        return [];
      }
      return data || [];
    },
    enabled: !!crecheId,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Attendance</DialogTitle>
          <DialogDescription>Mark students as Present, Late, or Absent.</DialogDescription>
        </DialogHeader>

        {isLoadingStudents || isLoadingAttendance ? (
          <div>Loading...</div>
        ) : (
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
                  const studentAttendance = attendance.find((att) => att.student_id === student.id);

                  return (
                    <tr key={student.id} className="border-b">
                      <td className="p-2">{student.name}</td>
                      <td className="p-2">
                        {studentAttendance ? <span>{studentAttendance.status}</span> : <span>No status</span>}
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateAttendance(student.id, "present")}
                            disabled={studentAttendance?.status === "present"}
                          >
                            Present
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateAttendance(student.id, "late")}
                            disabled={studentAttendance?.status === "late"}
                          >
                            Late
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateAttendance(student.id, "absent")}
                            disabled={studentAttendance?.status === "absent"}
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
        )}
      </DialogContent>
    </Dialog>
  );
};
