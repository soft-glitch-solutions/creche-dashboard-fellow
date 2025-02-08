import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Student {
  id: string;
  name: string;
}

interface AttendanceSheetProps {
  students: Student[];
  isOpen: boolean;
  onClose: () => void;
}

export const AttendanceSheet = ({ students, isOpen, onClose }: AttendanceSheetProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAttendance = async (status: "Present" | "Absent") => {
    if (currentIndex >= students.length) return;

    const student = students[currentIndex];
    setIsSubmitting(true);

    try {
      const today = new Date().toISOString().split("T")[0];

      const { error } = await supabase
        .from("attendance_students")
        .insert({
          student_id: student.id,
          attendance_date: today,
          status: status,
        });

      if (error) throw error;

      if (currentIndex === students.length - 1) {
        toast({
          title: "Success",
          description: "Attendance recorded for all students",
        });
        onClose();
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error recording attendance:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to record attendance",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStudent = students[currentIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Attendance</DialogTitle>
        </DialogHeader>

        {currentStudent && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">{currentStudent.name}</h3>
              <p className="text-muted-foreground">
                Student {currentIndex + 1} of {students.length}
              </p>
            </div>

            {/* Attendance Buttons */}
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => handleAttendance("Present")}
                disabled={isSubmitting}
                className="w-32 border-green-500 text-green-500 hover:bg-green-100 bg-transparent"
                variant="outline"
              >
                <Check className="mr-2 h-4 w-4" />
                Present
              </Button>
              <Button
                onClick={() => handleAttendance("Absent")}
                disabled={isSubmitting}
                className="w-32 border-red-500 text-red-500 hover:bg-red-100 bg-transparent"
                variant="outline"
              >
                <X className="mr-2 h-4 w-4" />
                Absent
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
